# Warnings
import warnings
warnings.filterwarnings("ignore")
warnings.simplefilter('ignore', DeprecationWarning)

# Libraries
from fastapi import FastAPI
from pydantic import BaseModel
import pandas as pd
import pickle

# Creating the API
app = FastAPI(title="Wren & Co recommender")

# Loading rules and frequent items
with open("frequent_items.pkl", "rb") as f:
    frequent_itemset = pickle.load(f)

with open("asso_rules.pkl", "rb") as f:
    rules = pickle.load(f)

# Top 3 most popular products
# (In case that a client selects rules that aren't matched)
top3 = frequent_itemset.head(3).copy()
top3 = top3["itemsets"].apply(lambda x: ", ".join(sorted(x)))

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

# input_p = ["THROW BLANKET", "METAL WALL CLOCK"] # Ideal input
# recs = recommend(input_p, rules)

# print("Products:", input_p)
# print("Recomendations:", recs)

class ClientIn(BaseModel):
    basket_items: list[str]

@app.post("/product")
def predict(data: ClientIn):

    print("Basket received:", data.basket_items)

    recs = recommend(data.basket_items, rules)

    response = [
        {
            "description": r,
            "source": "rules"
        }
        for r in recs
    ]

    return {
        "recommendations": response
    }