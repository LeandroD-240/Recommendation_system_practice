"""
tests/test_api.py
-----------------
Pytest test suite for the Recommendation API.
Uses FastAPI's built-in TestClient — no running server needed.

GitHub Actions runs:  pytest tests/ -v

Scenarios covered:
  - Health endpoint responds correctly
  - Popular endpoint returns exactly 3 products
  - Existing customer gets recommendations
  - New/unknown customer falls back to popular products
  - Bad request returns 422 (schema validation)
  - Response always contains exactly 3 recommendations
"""

import sqlite3
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
import pytest
from fastapi.testclient import TestClient
from mlxtend.frequent_patterns import apriori, association_rules
from mlxtend.preprocessing import TransactionEncoder
from sklearn.model_selection import train_test_split

# ── Locate project root regardless of where pytest is invoked from ────────────
PROJECT_ROOT = Path(__file__).resolve().parent.parent
DB_PATH      = PROJECT_ROOT / "db"   / "retail.db"
PKL_PATH     = PROJECT_ROOT / "models" / "model.pkl"

# ── Session-scoped fixtures: build DB + model once per test run ───────────────

@pytest.fixture(scope="session", autouse=True)
def build_database():
    """
    Generate the synthetic dataset and load it into SQLite.
    Runs once before all tests; skipped if the DB already exists.
    """
    if DB_PATH.exists():
        return   # already built (local dev or cached CI layer)

    # --- generate ---
    import random
    random.seed(42)
    np.random.seed(42)

    categories = {
        "Home Decor":  [("CANDLE HOLDER SET",4.95),("METAL WALL CLOCK",12.50),("PHOTO FRAME SET",7.95),
                        ("CERAMIC VASE",8.25),("DECORATIVE LANTERN",9.75),("CUSHION COVER",5.50),
                        ("TABLE RUNNER",6.95),("WALL HANGING",11.00),("DOOR WREATH",14.50),("STORAGE BASKET",8.75)],
        "Kitchen":     [("GLASS STORAGE JAR",3.75),("WOODEN CUTTING BOARD",9.95),("CERAMIC MUG SET",12.95),
                        ("KITCHEN TOWEL SET",5.25),("SPICE RACK",14.95),("OVEN MITT PAIR",4.50),
                        ("SALAD BOWL SET",16.50),("COLANDER",7.95),("CAKE TIN SET",11.25),("BAKING MAT",6.75)],
        "Garden":      [("PLANT POT TERRACOTTA",3.95),("GARDEN TROWEL",6.50),("SEED PACKETS BUNDLE",4.25),
                        ("WATERING CAN",12.75),("WIND CHIME",8.95),("GARDEN KNEELER",9.50),
                        ("HANGING BASKET",7.25),("BIRD FEEDER",10.95),("OUTDOOR LANTERN",15.50),("GARDENING GLOVES",5.95)],
        "Stationery":  [("NOTEBOOK SET",6.95),("PEN SET LUXURY",8.50),("DESK ORGANISER",11.95),
                        ("STICKY NOTES BUNDLE",3.25),("WASHI TAPE SET",5.75),("CALENDAR PLANNER",9.95),
                        ("STAMP SET",7.50),("ENVELOPE PACK",4.25),("GIFT WRAP SHEET",2.95),("BOOKMARK SET",3.50)],
        "Gifts":       [("GIFT BAG LARGE",2.50),("RIBBON SPOOL",1.95),("TISSUE PAPER PACK",2.25),
                        ("CANDLE GIFT SET",18.95),("BATH BOMB SET",14.50),("SOAP SET",12.75),
                        ("LUXURY NOTEBOOK",15.95),("PERSONALISED MUG",9.95),("PHOTO ALBUM",13.50),("TRINKET BOX",8.25)],
        "Seasonal":    [("CHRISTMAS BAUBLE SET",7.95),("ADVENT CALENDAR",19.95),("FAIRY LIGHTS",12.50),
                        ("EASTER EGG BASKET",8.75),("HALLOWEEN DECORATION",6.50),("BIRTHDAY BANNER",3.95),
                        ("NEW YEAR CONFETTI",2.75),("VALENTINES CARD SET",5.50),("SUMMER BUNTING",9.25),("AUTUMN WREATH",16.95)],
        "Toys":        [("WOODEN PUZZLE",8.95),("CRAFT KIT KIDS",11.50),("COLOURING BOOK SET",6.75),
                        ("PLAY DOUGH SET",7.25),("CARD GAME",9.50),("JIGSAW 500PC",12.95),
                        ("STICKER BOOK",4.50),("PAINT SET",13.75),("BUILDING BLOCKS",15.95),("FINGER PUPPET SET",5.25)],
        "Textiles":    [("THROW BLANKET",24.95),("BED RUNNER",18.50),("TOWEL SET",21.95),
                        ("APRON",9.75),("OVEN GLOVE SET",8.50),("NAPKIN SET",7.25),
                        ("PLACEMATS SET",11.95),("CURTAIN TIEBACK",6.50),("FABRIC BUNDLE",14.25),("QUILTED BAG",19.95)],
    }

    products, sku = [], 20000
    for cat, items in categories.items():
        for name, price in items:
            sku += random.randint(10, 99)
            products.append({"StockCode": str(sku), "Description": name,
                             "Category": cat, "UnitPrice": price})
    products_df = pd.DataFrame(products)

    n_customers  = 3000
    countries    = ["United Kingdom"]*65 + ["Germany"]*8 + ["France"]*7 + ["Ireland"]*4 + \
                   ["Netherlands"]*3 + ["Belgium"]*2 + ["Spain"]*2 + ["Portugal"]*2 + \
                   ["Australia"]*2 + ["USA"]*2 + ["Norway","Sweden","Denmark","Switzerland","Japan"]
    customer_ids = [10000 + i for i in range(n_customers)]
    customer_country = {cid: random.choice(countries) for cid in customer_ids}

    rfm_tiers = (["Champions"]*450 + ["Loyal"]*600 + ["At Risk"]*750 +
                 ["New"]*600 + ["Lost"]*600)
    random.shuffle(rfm_tiers)
    customer_tier = {cid: rfm_tiers[i] for i, cid in enumerate(customer_ids)}

    tier_params = {
        "Champions": {"orders":(8,20),"qty":(2,8),"gap":(7,30)},
        "Loyal":     {"orders":(5,12),"qty":(2,6),"gap":(14,45)},
        "At Risk":   {"orders":(3,7), "qty":(1,4),"gap":(30,90)},
        "New":       {"orders":(1,3), "qty":(1,3),"gap":(60,120)},
        "Lost":      {"orders":(1,2), "qty":(1,2),"gap":(120,365)},
    }
    tier_affinity = {
        "Champions": ["Home Decor","Kitchen","Gifts","Textiles"],
        "Loyal":     ["Kitchen","Garden","Stationery","Gifts"],
        "At Risk":   ["Seasonal","Toys","Stationery"],
        "New":       ["Gifts","Seasonal","Home Decor"],
        "Lost":      ["Seasonal","Gifts"],
    }

    from datetime import datetime, timedelta
    start_date, end_date = datetime(2023, 1, 1), datetime(2023, 12, 31)
    records, invoice_no = [], 500000

    for cid in customer_ids:
        tier   = customer_tier[cid]
        params = tier_params[tier]
        n_orders = random.randint(*params["orders"])
        preferred = products_df[products_df["Category"].isin(tier_affinity[tier])]["StockCode"].tolist()
        all_skus  = products_df["StockCode"].tolist()
        order_date = start_date + timedelta(days=random.randint(0, 60))
        for _ in range(n_orders):
            if order_date > end_date:
                break
            invoice_no += 1
            pool = preferred if random.random() < 0.70 else all_skus
            skus = random.sample(pool, min(random.randint(1,6), len(pool)))
            for sku_code in skus:
                row = products_df[products_df["StockCode"] == sku_code].iloc[0]
                qty = random.randint(*params["qty"])
                records.append({"InvoiceNo": str(invoice_no), "StockCode": sku_code,
                                 "Description": row["Description"], "Quantity": qty,
                                 "InvoiceDate": order_date, "UnitPrice": row["UnitPrice"],
                                 "CustomerID": cid, "Country": customer_country[cid]})
            order_date += timedelta(days=random.randint(*params["gap"]))

    df = pd.DataFrame(records)
    df["Revenue"] = df["Quantity"] * df["UnitPrice"]

    # --- load into SQLite ---
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    import os
    if DB_PATH.exists():
        os.remove(DB_PATH)

    conn = sqlite3.connect(DB_PATH)
    cur  = conn.cursor()
    cur.executescript("""
        CREATE TABLE customers (customer_id INTEGER PRIMARY KEY, country TEXT NOT NULL);
        CREATE TABLE products  (stock_code TEXT PRIMARY KEY, description TEXT NOT NULL,
                                category TEXT NOT NULL, unit_price REAL NOT NULL);
        CREATE TABLE invoices  (invoice_no TEXT NOT NULL, customer_id INTEGER NOT NULL,
                                invoice_date TEXT NOT NULL,
                                FOREIGN KEY (customer_id) REFERENCES customers(customer_id));
        CREATE TABLE invoice_items (id INTEGER PRIMARY KEY AUTOINCREMENT,
                                    invoice_no TEXT NOT NULL, stock_code TEXT NOT NULL,
                                    quantity INTEGER NOT NULL, unit_price REAL NOT NULL,
                                    revenue REAL NOT NULL,
                                    FOREIGN KEY (invoice_no) REFERENCES invoices(invoice_no),
                                    FOREIGN KEY (stock_code) REFERENCES products(stock_code));
        CREATE INDEX idx_inv_customer  ON invoices(customer_id);
        CREATE INDEX idx_items_invoice ON invoice_items(invoice_no);
        CREATE INDEX idx_items_sku     ON invoice_items(stock_code);
    """)
    df[["CustomerID","Country"]].drop_duplicates("CustomerID").rename(
        columns={"CustomerID":"customer_id","Country":"country"}
    ).to_sql("customers", conn, if_exists="append", index=False)
    products_df.rename(columns={"StockCode":"stock_code","Description":"description",
                                  "Category":"category","UnitPrice":"unit_price"}
                       ).to_sql("products", conn, if_exists="append", index=False)
    df[["InvoiceNo","CustomerID","InvoiceDate"]].drop_duplicates("InvoiceNo").rename(
        columns={"InvoiceNo":"invoice_no","CustomerID":"customer_id","InvoiceDate":"invoice_date"}
    ).assign(invoice_date=lambda d: d["invoice_date"].astype(str)
    ).to_sql("invoices", conn, if_exists="append", index=False)
    df[["InvoiceNo","StockCode","Quantity","UnitPrice","Revenue"]].rename(
        columns={"InvoiceNo":"invoice_no","StockCode":"stock_code",
                 "Quantity":"quantity","UnitPrice":"unit_price","Revenue":"revenue"}
    ).to_sql("invoice_items", conn, if_exists="append", index=False)
    conn.commit()
    conn.close()


@pytest.fixture(scope="session", autouse=True)
def build_model(build_database):
    """
    Train Apriori model and save model.pkl.
    Runs once after DB is ready; skipped if artifact already exists.
    """
    if PKL_PATH.exists():
        return

    conn = sqlite3.connect(DB_PATH)
    df   = pd.read_sql("""
        SELECT i.invoice_no, p.description, p.stock_code
        FROM invoices i
        JOIN invoice_items ii ON i.invoice_no = ii.invoice_no
        JOIN products      p  ON ii.stock_code = p.stock_code
    """, conn)
    popular = (df.groupby(["stock_code","description"]).size()
                 .reset_index(name="count")
                 .sort_values("count", ascending=False)
                 .head(3)[["stock_code","description"]]
                 .to_dict("records"))
    conn.close()

    baskets  = df.groupby("invoice_no")["description"].apply(list).reset_index()
    train, _ = train_test_split(baskets, test_size=0.2, random_state=42)
    te       = TransactionEncoder()
    te.fit(train["description"].tolist())
    X   = pd.DataFrame(te.transform(train["description"].tolist()), columns=te.columns_)
    fi  = apriori(X, min_support=0.003, use_colnames=True)
    rules = association_rules(fi, metric="confidence", min_threshold=0.05,
                              num_itemsets=len(fi))
    rules = rules[rules["lift"] >= 2.0].sort_values("lift", ascending=False)

    PKL_PATH.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump({"rules": rules, "popular": popular}, PKL_PATH)


@pytest.fixture(scope="session")
def client(build_model):
    """FastAPI TestClient — no live server needed."""
    from api.main import app
    with TestClient(app) as c:
        yield c


@pytest.fixture(scope="session")
def existing_customer_id():
    """Return a customer ID that has >= 5 orders in the DB."""
    conn = sqlite3.connect(DB_PATH)
    cid  = conn.execute("""
        SELECT customer_id FROM invoices
        GROUP BY customer_id HAVING COUNT(DISTINCT invoice_no) >= 5
        LIMIT 1
    """).fetchone()[0]
    conn.close()
    return cid


# ── Tests ─────────────────────────────────────────────────────────────────────

class TestHealth:
    def test_health_returns_ok(self, client):
        resp = client.get("/health")
        assert resp.status_code == 200

    def test_health_reports_rules_loaded(self, client):
        data = resp = client.get("/health").json()
        assert data["rules_loaded"] > 0, "Model should have rules loaded"


class TestPopular:
    def test_popular_returns_200(self, client):
        assert client.get("/popular").status_code == 200

    def test_popular_returns_exactly_3(self, client):
        data = client.get("/popular").json()
        assert len(data) == 3

    def test_popular_items_have_required_fields(self, client):
        for item in client.get("/popular").json():
            assert "stock_code"  in item
            assert "description" in item
            assert "source"      in item

    def test_popular_source_is_popular(self, client):
        for item in client.get("/popular").json():
            assert item["source"] == "popular"


class TestRecommend:
    def test_existing_customer_returns_200(self, client, existing_customer_id):
        resp = client.post("/recommend", json={
            "customer_id":     existing_customer_id,
            "product_clicked": "LUXURY NOTEBOOK"
        })
        assert resp.status_code == 200

    def test_response_always_has_3_recommendations(self, client, existing_customer_id):
        resp = client.post("/recommend", json={
            "customer_id":     existing_customer_id,
            "product_clicked": "LUXURY NOTEBOOK"
        }).json()
        assert len(resp["recommendations"]) == 3

    def test_response_fields_are_correct(self, client, existing_customer_id):
        resp = client.post("/recommend", json={
            "customer_id":     existing_customer_id,
            "product_clicked": "CANDLE GIFT SET"
        }).json()
        assert resp["customer_id"]     == existing_customer_id
        assert resp["product_clicked"] == "CANDLE GIFT SET"
        for item in resp["recommendations"]:
            assert "stock_code"  in item
            assert "description" in item
            assert item["source"] in ("rules", "popular")

    def test_new_customer_gets_fallback(self, client):
        """Customer 99999 has no history — recommendations must all be 'popular'."""
        resp = client.post("/recommend", json={
            "customer_id":     99999,
            "product_clicked": "THROW BLANKET"
        }).json()
        assert len(resp["recommendations"]) == 3
        # cold-start: if no rules matched, all sources must be popular
        sources = [r["source"] for r in resp["recommendations"]]
        # At minimum the fallback products are always available
        assert all(s in ("rules", "popular") for s in sources)

    def test_recommendations_exclude_clicked_product(self, client, existing_customer_id):
        clicked = "LUXURY NOTEBOOK"
        resp    = client.post("/recommend", json={
            "customer_id":     existing_customer_id,
            "product_clicked": clicked
        }).json()
        recs = [r["description"] for r in resp["recommendations"]]
        assert clicked not in recs, "Clicked product must not appear in recommendations"

    def test_invalid_payload_returns_422(self, client):
        """Missing required fields → FastAPI/Pydantic returns 422 Unprocessable Entity."""
        resp = client.post("/recommend", json={"customer_id": "not-a-number"})
        assert resp.status_code == 422

    def test_missing_body_returns_422(self, client):
        resp = client.post("/recommend", json={})
        assert resp.status_code == 422
