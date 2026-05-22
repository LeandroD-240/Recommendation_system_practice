# Recommendation System — Wren & Co.

<!-- BADGES — update YOUR_USERNAME and YOUR_REPO before publishing -->
![Status](https://img.shields.io/badge/status-finished-BEEF9E?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-A188A6?style=flat-square)
![Python](https://img.shields.io/badge/Python-3.11-01386A?style=flat-square&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.136-01386A?style=flat-square&logo=fastapi&logoColor=white)
![mlxtend](https://img.shields.io/badge/mlxtend-0.24.0-01386A?style=flat-square)

---

## Index

1. [Description](#description)
2. [Project status](#project-status)
3. [Functionalities](#functionalities)
4. [Access](#access)
   - [Non-technical users](#non-technical-users)
   - [Technical users](#technical-users)
5. [Technologies](#technologies)
6. [License](#license)

---

## Description

This project builds a **real-time product recommendation system** for Wren & Co., a fictional UK-based online home goods retailer. It was developed as a portfolio project applying both **data science** and **business analytics** methodology end to end — from root cause analysis and KPI definition, through data modelling and API deployment, to a working frontend storefront.

The core objective is to answer a real business question:

> *How can a company increase revenue per customer without additional marketing spend?*

The solution is an **Apriori association rules engine** trained on customer transaction history. When a customer views any product, the system surfaces 3 personalised cross-sell recommendations in real time. For new customers with no purchase history, it falls back to the 3 most globally popular products automatically.

The project follows the **CRISP-DM methodology** (Cross-Industry Standard Process for Data Mining) and covers all six phases: Business Understanding, Data Understanding, Data Preparation, Modelling, Evaluation, and Deployment.

**Projected business impact:** £127,537 annual revenue uplift based on a conservative 5% AOV increase and 3pp repeat purchase rate improvement (industry benchmarks: [McKinsey, 2021](https://www.mckinsey.com/capabilities/growth-marketing-and-sales/our-insights/the-value-of-getting-personalization-right-or-wrong-is-multiplying)).

---

## Project Status

**✅ Finished**

All phases of CRISP-DM are complete and documented:

| Phase | Status |
|---|---|
| Business Understanding | ✅ Complete — 5 Whys, KPIs, business levers, DS validation |
| Data Understanding | ✅ Complete — schema, stats, limitations |
| Data Preparation | ✅ Complete — SQLite DB, cleaning, feature engineering |
| Modelling | ✅ Complete — Apriori, 202 rules, lift ≥ 2.0 |
| Evaluation | ✅ Complete — hit rate 22.2%, coverage 96.7%, precision@5 5.0% |
| Deployment | ✅ Complete — FastAPI, frontend storefront |

---

## Functionalities

**Recommendation engine**
- Apriori association rules trained on 59,052 transactions across 16,851 orders
- 202 quality rules with avg lift of 2.35× (products 2.35× more likely to be bought together than by chance)
- Basket-aware: recommendations update in real time as the customer adds items
- Cold-start fallback: new customers always receive the 3 most popular products

**REST API**
- `GET /Home` — Home page
- `GET /product` — Products details, basket and recommendation products
- `GET /api/products` and `GET /api/product` — Loading the products on the products page
- `POST /recommend` — returns 3 personalised recommendations for a customer + clicked product
- Automatic interactive docs at `/docs` (Swagger UI)

**Frontend storefront**
- `index.html` — hero landing page with filterable product grid (80 products, 8 categories)
- `product.html` — product detail with qty controls, persistent basket, and live recommendations panel
- Basket persists across product page navigation
- Category images configurable via a single `CAT_IMG` object
- Fully responsive, no framework dependencies, zero build step

**Business documentation**
- One-page [executive summary]()
- CRISP-DM [notebook]() with EDA and modeling
- [Presentation]() of the project

---

## Access

### Non-technical users

The frontend can be opened directly in any modern browser — no installation required.

Here is the page

---

### Technical users

#### Quickstart

```bash
# 1. Clone the repository
git clone https://github.com/LeandroD-240/Recommendation_system_practice.git
cd Recommendation_system_practice

# 2. Install dependencies
pip install -r requirements.txt

# 3. Train the model
# Explore the notebook in the `notebook` folder
# Load and train the model (the frequent items and the association rules)

# 4. Start the API
uvicorn main:app --reload --port 8000

# 5. Open the frontend
# Open index.html in your browser
# Or use Live Server in VS Code / GitHub Codespaces
```

The API documentation is available at `http://127.0.0.1:8000/docs` once the server is running.

#### Project structure

```
├── Recommendation_system_practice/
│   └── data/
|       ├── retail.db             # Dataset
|       ├── frequent_items.pkl    # Frequent items
|       └── asso_rules.pkl        # Association rules
│   └── static/
|       ├── img/                  # Images of the products
|       ├── styles.css            # Stylish of the page and project
|       ├── script.js             # JS for the dinamics of the home page
|       └── script_2.js           # JS for the dinamics of the products page
│   └── templates/
|       ├── index.html            # Home page file
|       └── product.html          # Products page file
|   ├── main.py                   # Python file with API requests and loading association rules
|   ├── README.md                 # This file
|   ├── render.yaml               # Render for upload the page
|   ├── requirements.txt          # Packages for pip
```

#### Dockerfile

Docker is not included in this project by default, but the setup is straightforward if you want to containerise the API:

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

```bash
docker build -t wren-api .
docker run -p 8000:8000 wren-api
```

---

## Technologies

| Layer | Technology | Purpose |
|---|---|---|
| **Data** | Python 3.11, pandas | Data generation, cleaning, feature engineering |
| **Database** | SQLite | Transaction storage, customer history lookups, realistic work scenario |
| **Modelling** | mlxtend (Apriori) | Association rules, frequent itemset mining |
| **Serialisation** | pickle | Model artifact persistence |
| **API** | FastAPI, uvicorn | Real-time recommendation serving |
| **Validation** | Pydantic | Request/response schema enforcement |
| **Frontend** | HTML5, CSS3, JavaScript | Product storefront, basket, recommendation UI |
| **Visualisation** | matplotlib | EDA dashboard, KPI charts |
| **Methodology** | CRISP-DM | End-to-end data science process framework |

---

## License

This project is licensed under the **MIT License** — see the [`LICENSE`](LICENSE) file for details.