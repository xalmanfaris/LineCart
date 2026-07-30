# TODO: Connect frontend to backend API for products

## Status: Completed

### Files Edited:
1. [x] src/api.js - Already has getProducts() and getProductById() functions
2. [x] src/pages/Shop.jsx - Replaced db.json import with API call to getProducts()
3. [x] src/pages/ProductView.jsx - Replaced db.json lookup with API call to getProductById()
4. [x] src/App.jsx (Home page) - Replaced db.json import with API call to getProducts()

### Steps Completed:
1. [x] Update Shop.jsx to fetch products from backend API using getProducts()
2. [x] Update ProductView.jsx to fetch product by ID from backend API using getProductById()
3. [x] Update App.jsx to fetch products from backend API for home page
4. [x] Handle data structure mapping (backend: Id, Images[] vs frontend: id, images[])

### Notes:
- All existing filtering/searching features kept client-side
- Same design maintained unchanged
- Loading states are handled via the API calls
- Make sure backend server is running at https://localhost:7091

