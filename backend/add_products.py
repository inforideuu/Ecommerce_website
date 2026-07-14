import os, django, json, random
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'django_backend.settings')
django.setup()

from api.models import Category, Product

# Fetch all subcategories
subcats = Category.objects.filter(id__startswith='sub-')
print(f"Found {subcats.count()} subcategories.")

# Helper to find department name
def get_dept(gp_id):
    if gp_id.startswith('gp-m'):
        return 'Men'
    elif gp_id.startswith('gp-w'):
        return 'Women'
    elif gp_id.startswith('gp-k'):
        return 'Kids'
    return 'General'

# Mock images by category/dept
mock_images = {
    'Men': [
        "https://images.unsplash.com/photo-1488161628813-04466f872be2?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop&q=80"
    ],
    'Women': [
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&auto=format&fit=crop&q=80"
    ],
    'Kids': [
        "https://images.unsplash.com/photo-1519457431-44ccd64a579b?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1471286174240-e6458e7b9049?w=800&auto=format&fit=crop&q=80"
    ],
    'General': [
        "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&auto=format&fit=crop&q=80"
    ]
}

created_count = 0
for sub in subcats:
    dept = get_dept(sub.parentCategory)
    # Create two products
    for i in range(1, 3):
        p_id = f"p-{sub.id}-{i}"
        if Product.objects.filter(id=p_id).exists():
            continue
        
        price = float(random.choice([1299, 1599, 1999, 2499, 2999, 3499, 3999, 4999, 5999, 7999, 8999]))
        orig_price = float(price + random.choice([200, 500, 1000, 1500]))
        discount = round(((orig_price - price) / orig_price) * 100, 1)

        p = Product(
            id=p_id,
            name=f"Signature {sub.name} - Edition {i}",
            category=dept, # Department name (Men/Women/Kids)
            categoryGroup=dept, # Department name (Men/Women/Kids)
            subcategory=sub.name, # Subcategory name
            brand=random.choice(["Gucci", "Prada", "Armani", "Versace", "Louis Vuitton", "Chanel"]),
            price=price,
            originalPrice=orig_price,
            discount=discount,
            costPrice=price * 0.4,
            sku=f"SKU-{sub.id.upper()}-{i}",
            barcode=f"BAR-{random.randint(100000000000, 999999999999)}",
            description=f"Indulge in absolute luxury with our premium {sub.name} designed specifically for the discerning eye. Crafted from elite fabrics tailored to perfection.",
            images=json.dumps(mock_images.get(dept, mock_images['General'])),
            sizes=json.dumps(["S", "M", "L", "XL"]),
            colors=json.dumps(["#111827", "#D4AF37", "#1E3A8A"]),
            material="Premium Blend",
            stock=random.randint(10, 80),
            weight=0.5,
            dimensions="30x20x5 cm",
            status="active",
            seoKeywords=f"luxury {sub.name.lower()}, premium apparel, designers wear",
            rating=round(random.uniform(4.2, 5.0), 1),
            reviewsCount=random.randint(5, 200),
            inStock=1,
            trending=random.choice([0, 1]),
            featured=random.choice([0, 1]),
            bestSeller=random.choice([0, 1]),
            newArrival=random.choice([0, 1]),
            limitedEdition=random.choice([0, 1]),
            tag="New",
            occasion="Formal/Casual",
            productType=sub.name,
            details=json.dumps([{"Fabric": "Luxury Wool/Cotton Blend"}, {"Fit": "Custom Premium Fit"}])
        )
        p.save()
        created_count += 1

print(f"Done! Created {created_count} products.")
