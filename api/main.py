"""
Recommendation API
------------------
POST /recommend   → returns 3 product recommendations for a given customer + product
GET  /popular     → returns the 3 globally most popular products (fallback view)
GET  /health      → liveness check

Blueprint layer: Serving (Layer 3)
Model loaded once at startup from models/model.pkl (joblib artifact).
SQLite queried at runtime to fetch customer purchase history.
"""

import sqlite3
from contextlib import asynccontextmanager
from pathlib import Path

import joblib
import pandas as pd
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

# ── Paths ─────────────────────────────────────────────────────────────────────
BASE     = Path(__file__).resolve().parent.parent
DB_PATH  = BASE / "db"  / "retail.db"
PKL_PATH = BASE / "models" / "model.pkl"

# ── Startup: load model once, keep in memory ──────────────────────────────────
# This is the key performance decision: loading joblib on every request
# would add ~200ms latency. Loading at startup keeps inference under 5ms.

model_store: dict = {}

@asynccontextmanager
async def lifespan(app: FastAPI):
    artifact         = joblib.load(PKL_PATH)
    model_store["rules"]   = artifact["rules"]     # DataFrame of association rules
    model_store["popular"] = artifact["popular"]   # list of dicts [{stock_code, description}]
    print(f"[startup] Model loaded — {len(model_store['rules'])} rules, "
          f"fallback: {[p['description'] for p in model_store['popular']]}")
    yield
    model_store.clear()
    print("[shutdown] Model unloaded")


app = FastAPI(
    title="Product Recommendation API",
    description="Cross-sell recommendations powered by Apriori association rules.",
    version="1.0.0",
    lifespan=lifespan,
)

# ── Schemas ───────────────────────────────────────────────────────────────────

class RecommendRequest(BaseModel):
    customer_id: int
    product_clicked: str   # description of the product the user just clicked

    model_config = {
        "json_schema_extra": {
            "examples": [{
                "customer_id": 10042,
                "product_clicked": "LUXURY NOTEBOOK"
            }]
        }
    }

class ProductOut(BaseModel):
    stock_code:  str
    description: str
    source:      str    # "rules" | "popular"

class RecommendResponse(BaseModel):
    customer_id:     int
    product_clicked: str
    recommendations: list[ProductOut]  # always exactly 3 items

# ── Helpers ───────────────────────────────────────────────────────────────────

def get_customer_history(customer_id: int) -> list[str]:
    """Fetch the list of product descriptions this customer has ever bought."""
    conn = sqlite3.connect(DB_PATH)
    rows = conn.execute("""
        SELECT DISTINCT p.description
        FROM   invoices      i
        JOIN   invoice_items ii ON i.invoice_no  = ii.invoice_no
        JOIN   products      p  ON ii.stock_code = p.stock_code
        WHERE  i.customer_id = ?
    """, (customer_id,)).fetchall()
    conn.close()
    return [r[0] for r in rows]


def rule_based_recs(basket: list[str],
                    rules: pd.DataFrame,
                    top_n: int = 3) -> list[str]:
    """
    Find rules whose antecedent is a subset of the current basket,
    return top-N consequents ranked by lift (quality) then confidence.
    Already-owned products are excluded from recommendations.
    """
    basket_set = set(basket)
    matched    = rules[rules["antecedents"].apply(lambda a: a.issubset(basket_set))]
    if matched.empty:
        return []
    recs = (matched
            .explode("consequents")
            .query("consequents not in @basket_set")
            .sort_values(["lift", "confidence"], ascending=False)
            .drop_duplicates("consequents")
            .head(top_n)["consequents"]
            .tolist())
    return recs


def get_product_meta(descriptions: list[str]) -> list[dict]:
    """Look up stock_code for a list of product descriptions."""
    if not descriptions:
        return []
    placeholders = ",".join("?" * len(descriptions))
    conn  = sqlite3.connect(DB_PATH)
    rows  = conn.execute(
        f"SELECT stock_code, description FROM products WHERE description IN ({placeholders})",
        descriptions
    ).fetchall()
    conn.close()
    # preserve the order of the input list
    meta_map = {r[1]: r[0] for r in rows}
    return [{"stock_code": meta_map.get(d, "N/A"), "description": d}
            for d in descriptions if d in meta_map]


# ── Endpoints ─────────────────────────────────────────────────────────────────

@app.get("/health", tags=["System"])
def health():
    """Liveness probe — confirms the API and model are loaded."""
    return {
        "status": "ok",
        "rules_loaded": len(model_store.get("rules", [])),
    }


@app.get("/popular", tags=["Recommendations"], response_model=list[ProductOut])
def popular_products():
    """
    Returns the 3 globally most popular products.
    Used as the default view before any user interaction.
    """
    return [
        ProductOut(stock_code=p["stock_code"],
                   description=p["description"],
                   source="popular")
        for p in model_store["popular"]
    ]


@app.post("/recommend", tags=["Recommendations"], response_model=RecommendResponse)
def recommend(req: RecommendRequest):
    """
    Core endpoint — called when a user clicks on a product.

    Logic (matches Blueprint Step 4-6):
      1. Fetch the customer's full purchase history from SQLite.
      2. Build the basket = history + product currently being viewed.
      3. Run association rules against the basket.
      4. If >= 3 rule-based recs exist → return them.
         If < 3 → top up with popular products until we have exactly 3.
      5. Never recommend something the customer already owns.
    """
    rules   = model_store["rules"]
    popular = model_store["popular"]

    # Step 1 — customer history
    history = get_customer_history(req.customer_id)

    # Step 2 — basket = history + clicked product
    basket  = list(set(history + [req.product_clicked]))

    # Step 3 — rule-based recommendations
    recs_from_rules = rule_based_recs(basket, rules, top_n=3)

    # Step 4 — fill up to exactly 3 using popular fallback
    already_recommended = set(recs_from_rules)
    already_owned       = set(basket)

    recs_final: list[ProductOut] = []

    for desc in recs_from_rules:
        meta = get_product_meta([desc])
        if meta:
            recs_final.append(ProductOut(**meta[0], source="rules"))

    if len(recs_final) < 3:
        for p in popular:
            if len(recs_final) >= 3:
                break
            if (p["description"] not in already_owned and
                    p["description"] not in already_recommended):
                recs_final.append(ProductOut(
                    stock_code=p["stock_code"],
                    description=p["description"],
                    source="popular"
                ))

    return RecommendResponse(
        customer_id=req.customer_id,
        product_clicked=req.product_clicked,
        recommendations=recs_final,
    )
