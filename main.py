# Warnings
import warnings
warnings.filterwarnings("ignore")
warnings.simplefilter('ignore', DeprecationWarning)

# Libraries
from fastapi import FastAPI, Request, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel
import pandas as pd
import pickle
import sqlite3

# Creating the API
app = FastAPI()

# Static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# Templates
templates = Jinja2Templates(directory="templates")

# Home page
@app.get("/")
def home(request: Request):

    return templates.TemplateResponse(
        request=request,
        name="index.html"
    )

# Product page
@app.get("/product")
def product_page(request: Request):

    return templates.TemplateResponse(
        request=request,
        name="product.html"
    )

# Loading rules and frequent items
with open("data/frequent_items.pkl", "rb") as f:
    frequent_itemset = pickle.load(f)

with open("data/asso_rules.pkl", "rb") as f:
    rules = pickle.load(f)

# Top 3 most popular products
# (In case that a client selects rules that aren't matched)
top3 = frequent_itemset.head(3).copy()
top3 = top3["itemsets"].apply(lambda x: ", ".join(sorted(x)))

# Database helpers
def get_db_connection():
    conn = sqlite3.connect("data/retail.db")
    conn.row_factory = sqlite3.Row
    return conn

def load_products() -> list[dict]:
    with get_db_connection() as conn:
        rows = conn.execute(
            "SELECT stock_code, description, category, unit_price FROM products"
        ).fetchall()
    return [
        {
            "sku": row["stock_code"],
            "name": row["description"],
            "category": row["category"],
            "price": float(row["unit_price"]),
        }
        for row in rows
    ]

def load_product(stock_code: str) -> dict | None:
    with get_db_connection() as conn:
        row = conn.execute(
            "SELECT stock_code, description, category, unit_price FROM products WHERE stock_code = ?",
            (stock_code,),
        ).fetchone()
    if not row:
        return None
    return {
        "sku": row["stock_code"],
        "name": row["description"],
        "category": row["category"],
        "price": float(row["unit_price"]),
    }

@app.get("/api/products")
def api_products():
    return load_products()

@app.get("/api/products/{stock_code}")
def api_product(stock_code: str):
    product = load_product(stock_code)
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

# Recommender
def recommend(basket_items: list, rules_df: pd.DataFrame, top_n: int = 3) -> list:
    """
    Given products already in a basket, return top-N recommendations
    by finding rules whose antecedent is a subset of the basket,
    then ranking matched consequents by lift then confidence.
    """
    basket_set = set(basket_items)
    matched = rules_df[
        rules_df["antecedents"].apply(lambda a: a.issubset(basket_set))
    ]
    if matched.empty:
        return top3.tolist()
    recs = (matched.explode("consequents")
                   .query("consequents not in @basket_set")
                   .sort_values(["lift","confidence"], ascending=False)
                   .drop_duplicates("consequents")
                   .head(top_n)["consequents"]
                   .tolist())
    return recs

# Input Schema
class ClientIn(BaseModel):
    basket_items: list[str]

# Endpoints
@app.post("/recommend")
def predict(data: ClientIn):

    print("Basket received:", data.basket_items)

    recs = recommend(data.basket_items, rules)
    is_fallback = recs == top3.tolist()

    response = [
        {
            "description": r,
            "source": "popular" if is_fallback else "rules"
        }
        for r in recs
    ]

    return {
        "recommendations": response
    }
