import json
import random
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.db import models
from .models import Product, Category, Order, Customer, Setting, Brand, Coupon, Review, SupportTicket, SupportMessage

# Automatic database seeder for default mock apparel collections
def check_and_seed():
    try:
        if Setting.objects.filter(key="db_is_seeded").exists():
            return
        if Product.objects.count() == 0:
            products_seed = []
            for p in products_seed:
                Product.objects.create(**p)

        # Delete any existing Women or Kids categories from database
        Category.objects.filter(name__in=['Women', 'Kids']).delete()
        Category.objects.filter(id__in=['cat-2', 'cat-3']).delete()

        if Category.objects.count() == 0 or Category.objects.filter(name='Women').exists() or Category.objects.filter(name='Kids').exists():
            Category.objects.all().delete()
            categories_seed = [
                {"id": "cat-1", "name": "Men", "parentCategory": "None", "slug": "men", "status": "active", "image": "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=800&auto=format&fit=crop&q=80"},
                {"id": "gp-m1", "name": "Top Wear", "parentCategory": "cat-1", "slug": "top-wear", "status": "active"},
                {"id": "gp-m2", "name": "Bottom Wear", "parentCategory": "cat-1", "slug": "bottom-wear", "status": "active"},
                {"id": "gp-m3", "name": "Ethnic Wear", "parentCategory": "cat-1", "slug": "ethnic-wear", "status": "active"},
                {"id": "gp-m4", "name": "Innerwear", "parentCategory": "cat-1", "slug": "innerwear", "status": "active"},
                {"id": "gp-m5", "name": "Sports Wear", "parentCategory": "cat-1", "slug": "sports-wear", "status": "active"},
                {"id": "gp-m6", "name": "Night Wear", "parentCategory": "cat-1", "slug": "night-wear", "status": "active"},
                {"id": "gp-m7", "name": "Winter Wear", "parentCategory": "cat-1", "slug": "winter-wear", "status": "active"},
                {"id": "gp-m8", "name": "Footwear", "parentCategory": "cat-1", "slug": "footwear", "status": "active"},
                {"id": "gp-m9", "name": "Accessories", "parentCategory": "cat-1", "slug": "accessories", "status": "active"},
                {"id": "sub-m1-1", "name": "Shirts", "parentCategory": "gp-m1", "slug": "shirts", "status": "active"},
                {"id": "sub-m1-2", "name": "Casual Shirts", "parentCategory": "gp-m1", "slug": "casual-shirts", "status": "active"},
                {"id": "sub-m1-3", "name": "Formal Shirts", "parentCategory": "gp-m1", "slug": "formal-shirts", "status": "active"},
                {"id": "sub-m1-4", "name": "Linen Shirts", "parentCategory": "gp-m1", "slug": "linen-shirts", "status": "active"},
                {"id": "sub-m1-5", "name": "T-Shirts", "parentCategory": "gp-m1", "slug": "t-shirts", "status": "active"},
                {"id": "sub-m1-6", "name": "Polo T-Shirts", "parentCategory": "gp-m1", "slug": "polo-tshirts", "status": "active"},
                {"id": "sub-m1-7", "name": "Oversized T-Shirts", "parentCategory": "gp-m1", "slug": "oversized-tshirts", "status": "active"},
                {"id": "sub-m1-8", "name": "Sweatshirts", "parentCategory": "gp-m1", "slug": "sweatshirts", "status": "active"},
                {"id": "sub-m1-9", "name": "Hoodies", "parentCategory": "gp-m1", "slug": "hoodies", "status": "active"},
                {"id": "sub-m1-10", "name": "Jackets", "parentCategory": "gp-m1", "slug": "jackets", "status": "active"},
                {"id": "sub-m2-1", "name": "Jeans", "parentCategory": "gp-m2", "slug": "jeans", "status": "active"},
                {"id": "sub-m2-2", "name": "Trousers", "parentCategory": "gp-m2", "slug": "trousers", "status": "active"},
                {"id": "sub-m2-3", "name": "Chinos", "parentCategory": "gp-m2", "slug": "chinos", "status": "active"},
                {"id": "sub-m2-4", "name": "Cargo Pants", "parentCategory": "gp-m2", "slug": "cargo-pants", "status": "active"},
                {"id": "sub-m2-5", "name": "Joggers", "parentCategory": "gp-m2", "slug": "joggers", "status": "active"},
                {"id": "sub-m2-6", "name": "Shorts", "parentCategory": "gp-m2", "slug": "shorts", "status": "active"},
                {"id": "sub-m3-1", "name": "Kurtas", "parentCategory": "gp-m3", "slug": "kurtas", "status": "active"},
                {"id": "sub-m3-2", "name": "Kurta Sets", "parentCategory": "gp-m3", "slug": "kurta-sets", "status": "active"},
                {"id": "sub-m3-3", "name": "Nehru Jackets", "parentCategory": "gp-m3", "slug": "nehru-jackets", "status": "active"},
                {"id": "sub-m3-4", "name": "Sherwanis", "parentCategory": "gp-m3", "slug": "sherwanis", "status": "active"},
                {"id": "sub-m4-1", "name": "Vests", "parentCategory": "gp-m4", "slug": "vests", "status": "active"},
                {"id": "sub-m4-2", "name": "Briefs", "parentCategory": "gp-m4", "slug": "briefs", "status": "active"},
                {"id": "sub-m4-3", "name": "Trunks", "parentCategory": "gp-m4", "slug": "trunks", "status": "active"},
                {"id": "sub-m4-4", "name": "Boxers", "parentCategory": "gp-m4", "slug": "boxers", "status": "active"},
                {"id": "sub-m4-5", "name": "Thermal Wear", "parentCategory": "gp-m4", "slug": "thermal-wear", "status": "active"},
                {"id": "sub-m5-1", "name": "Gym T-Shirts", "parentCategory": "gp-m5", "slug": "gym-tshirts", "status": "active"},
                {"id": "sub-m5-2", "name": "Track Pants", "parentCategory": "gp-m5", "slug": "track-pants", "status": "active"},
                {"id": "sub-m5-3", "name": "Tracksuits", "parentCategory": "gp-m5", "slug": "tracksuits", "status": "active"},
                {"id": "sub-m5-4", "name": "Sports Shorts", "parentCategory": "gp-m5", "slug": "sports-shorts", "status": "active"},
                {"id": "sub-m5-5", "name": "Compression Wear", "parentCategory": "gp-m5", "slug": "compression-wear", "status": "active"},
                {"id": "sub-m6-1", "name": "Pyjamas", "parentCategory": "gp-m6", "slug": "pyjamas", "status": "active"},
                {"id": "sub-m6-2", "name": "Night Shorts", "parentCategory": "gp-m6", "slug": "night-shorts", "status": "active"},
                {"id": "sub-m6-3", "name": "Night Suits", "parentCategory": "gp-m6", "slug": "night-suits", "status": "active"},
                {"id": "sub-m7-1", "name": "Sweaters", "parentCategory": "gp-m7", "slug": "sweaters", "status": "active"},
                {"id": "sub-m7-2", "name": "Hoodies", "parentCategory": "gp-m7", "slug": "winter-hoodies", "status": "active"},
                {"id": "sub-m7-3", "name": "Jackets", "parentCategory": "gp-m7", "slug": "winter-jackets", "status": "active"},
                {"id": "sub-m7-4", "name": "Sweatshirts", "parentCategory": "gp-m7", "slug": "winter-sweatshirts", "status": "active"},
                {"id": "sub-m7-5", "name": "Blazers", "parentCategory": "gp-m7", "slug": "blazers", "status": "active"},
                {"id": "sub-m8-1", "name": "Sneakers", "parentCategory": "gp-m8", "slug": "sneakers", "status": "active"},
                {"id": "sub-m8-2", "name": "Casual Shoes", "parentCategory": "gp-m8", "slug": "casual-shoes", "status": "active"},
                {"id": "sub-m8-3", "name": "Formal Shoes", "parentCategory": "gp-m8", "slug": "formal-shoes", "status": "active"},
                {"id": "sub-m8-4", "name": "Loafers", "parentCategory": "gp-m8", "slug": "loafers", "status": "active"},
                {"id": "sub-m8-5", "name": "Sandals", "parentCategory": "gp-m8", "slug": "sandals", "status": "active"},
                {"id": "sub-m8-6", "name": "Slippers", "parentCategory": "gp-m8", "slug": "slippers", "status": "active"},
                {"id": "sub-m9-1", "name": "Watches", "parentCategory": "gp-m9", "slug": "watches", "status": "active"},
                {"id": "sub-m9-2", "name": "Wallets", "parentCategory": "gp-m9", "slug": "wallets", "status": "active"},
                {"id": "sub-m9-3", "name": "Belts", "parentCategory": "gp-m9", "slug": "belts", "status": "active"},
                {"id": "sub-m9-4", "name": "Sunglasses", "parentCategory": "gp-m9", "slug": "sunglasses", "status": "active"},
                {"id": "sub-m9-5", "name": "Caps", "parentCategory": "gp-m9", "slug": "caps", "status": "active"},
                {"id": "sub-m9-6", "name": "Jewellery", "parentCategory": "gp-m9", "slug": "jewellery", "status": "active"},
                {"id": "sub-m9-7", "name": "Bags", "parentCategory": "gp-m9", "slug": "bags", "status": "active"}
            ]
            for c in categories_seed:
                Category.objects.create(**c)

        if Customer.objects.count() == 0:
            customers_seed = []
            for cust in customers_seed:
                Customer.objects.create(**cust)

        if Order.objects.count() == 0:
            orders_seed = []
            for ord in orders_seed:
                Order.objects.create(**ord)

        if Setting.objects.count() == 0:
            settings_seed = [
                {"key": "store_name", "value": "Antigravity Haute Couture"},
                {"key": "contact_email", "value": "concierge@antigravity.luxury"},
                {"key": "global_shipping", "value": "true"},
                {"key": "supercoin_reward_percentage", "value": "25"}
            ]
            for s in settings_seed:
                Setting.objects.create(**s)
            Setting.objects.create(key="db_is_seeded", value="true")
        
        if not Setting.objects.filter(key="supercoin_reward_percentage").exists():
            Setting.objects.create(key="supercoin_reward_percentage", value="25")
    except Exception as e:
        print("Database seeding pre-run failed (might be migrating schemas):", e)

# Helper to calculate rating dynamically from verified purchases
def calculate_product_rating(product_id):
    try:
        orders_qs = Order.objects.exclude(reviews__isnull=True).exclude(reviews="")
        ratings = []
        for o in orders_qs:
            try:
                rev_dict = json.loads(o.reviews) if isinstance(o.reviews, str) else o.reviews
                if isinstance(rev_dict, dict) and product_id in rev_dict:
                    ratings.append(int(rev_dict[product_id].get("rating", 5)))
            except Exception:
                pass
        if ratings:
            avg_rating = round(sum(ratings) / len(ratings), 1)
            return avg_rating, len(ratings)
    except Exception:
        pass
    return 0.0, 0

# Helper to format Product objects to standard client JSON
def format_product(p, ratings_map=None):
    if ratings_map is not None:
        ratings = ratings_map.get(p.id, [])
        if ratings:
            final_rating = round(sum(ratings) / len(ratings), 1)
            final_count = len(ratings)
        elif p.reviewsCount > 0:
            final_rating = p.rating
            final_count = p.reviewsCount
        else:
            final_rating = 0.0
            final_count = 0
    else:
        dynamic_rating, dynamic_count = calculate_product_rating(p.id)
        if dynamic_count > 0:
            final_rating = dynamic_rating
            final_count = dynamic_count
        elif p.reviewsCount > 0:
            final_rating = p.rating
            final_count = p.reviewsCount
        else:
            final_rating = 0.0
            final_count = 0

    slug = ""
    seo_title = ""
    meta_desc = ""
    seo_keywords = p.seoKeywords or ""
    
    if seo_keywords.startswith("{") and seo_keywords.endswith("}"):
        try:
            seo_data = json.loads(seo_keywords)
            slug = seo_data.get("slug", "")
            seo_title = seo_data.get("seoTitle", "")
            meta_desc = seo_data.get("metaDescription", "")
            seo_keywords = seo_data.get("seoKeywords", "")
        except Exception:
            pass

    return {
        "id": p.id,
        "name": p.name,
        "category": p.category,
        "brand": p.brand,
        "price": p.price,
        "originalPrice": p.originalPrice,
        "discount": p.discount,
        "costPrice": p.costPrice,
        "sku": p.sku,
        "barcode": p.barcode,
        "description": p.description,
        "images": json.loads(p.images or "[]"),
        "sizes": json.loads(p.sizes or "[]"),
        "colors": json.loads(p.colors or "[]"),
        "material": p.material,
        "fabric": p.material,
        "stock": p.stock,
        "weight": p.weight,
        "dimensions": p.dimensions,
        "status": p.status,
        "slug": slug,
        "seoTitle": seo_title,
        "metaDescription": meta_desc,
        "seoKeywords": seo_keywords,
        "rating": final_rating,
        "reviewsCount": final_count,
        "inStock": bool(p.inStock and p.stock > 0),
        "trending": bool(p.trending),
        "featured": bool(p.featured),
        "bestSeller": bool(p.bestSeller),
        "newArrival": bool(p.newArrival),
        "limitedEdition": bool(p.limitedEdition),
        "tag": p.tag,
        "occasion": p.occasion,
        "categoryGroup": p.categoryGroup or "",
        "subcategory": p.subcategory or "",
        "productType": p.productType or "",
        "details": json.loads(p.details or "[]"),
        "videoUrl": p.videoUrl or "",
    }

# --- REST VIEWS ---

# 1. PRODUCTS API
def get_products(request):
    check_seed = request.GET.get('seed_check', 'true')
    if check_seed == 'true':
        check_and_seed()
        
    category = request.GET.get('category')
    gender = request.GET.get('gender')
    subcategory = request.GET.get('subcategory')
    trending = request.GET.get('trending')
    featured = request.GET.get('featured')
    best_seller = request.GET.get('bestSeller')
    
    qs = Product.objects.filter(status='active')
    
    from django.db.models.functions import Lower

    if gender:
        db_gender = gender
        try:
            all_cats = list(Product.objects.values_list('category', flat=True).distinct())
            cat_mapping = {c.lower(): c for c in all_cats if c}
            db_gender = cat_mapping.get(gender.lower(), gender)
        except Exception:
            gender_map = {'men': 'Men', 'women': 'Women', 'kids': 'Kids'}
            db_gender = gender_map.get(gender.lower(), gender)
        qs = qs.filter(category=db_gender)
    elif category:
        if category == 'Sale':
            qs = qs.filter(discount__gt=0)
        else:
            db_cat = category
            try:
                all_cats = list(Product.objects.values_list('category', flat=True).distinct())
                cat_mapping = {c.lower(): c for c in all_cats if c}
                db_cat = cat_mapping.get(category.lower(), category)
            except Exception:
                cat_map = {'men': 'Men', 'women': 'Women', 'kids': 'Kids'}
                db_cat = cat_map.get(category.lower(), category)
            qs = qs.filter(category=db_cat)
            
    if subcategory:
        clean_sub = subcategory.replace('-', ' ').replace('/', ' ').lower()
        sub_lower = subcategory.lower()
        
        resolved_name = None
        try:
            cat_obj = Category.objects.annotate(slug_lower=Lower('slug')).filter(slug_lower=sub_lower).first()
            if cat_obj:
                resolved_name = cat_obj.name.lower()
        except Exception:
            pass

        qs = qs.annotate(subcategory_lower=Lower('subcategory'), name_lower=Lower('name'))
        
        q_obj = (
            models.Q(subcategory_lower=sub_lower) | 
            models.Q(subcategory_lower=clean_sub) |
            models.Q(subcategory_lower__contains=sub_lower) |
            models.Q(subcategory_lower__contains=clean_sub) |
            models.Q(name_lower__contains=sub_lower) |
            models.Q(name_lower__contains=clean_sub)
        )
        if resolved_name:
            q_obj |= models.Q(subcategory_lower=resolved_name)
            q_obj |= models.Q(subcategory_lower__contains=resolved_name)
            
        qs = qs.filter(q_obj)
        
    if trending == 'true':
        qs = qs.filter(trending=1)
    if featured == 'true':
        qs = qs.filter(featured=1)
    if best_seller == 'true':
        qs = qs.filter(bestSeller=1)
        
    # Bulk prefetch product ratings from orders to avoid N+1 query database timeouts
    ratings_map = {}
    try:
        orders_qs = Order.objects.exclude(reviews__isnull=True).exclude(reviews="")
        for o in orders_qs:
            try:
                rev_dict = json.loads(o.reviews) if isinstance(o.reviews, str) else o.reviews
                if isinstance(rev_dict, dict):
                    for prod_id, rev_data in rev_dict.items():
                        rating = int(rev_data.get("rating", 5))
                        if prod_id not in ratings_map:
                            ratings_map[prod_id] = []
                        ratings_map[prod_id].append(rating)
            except Exception:
                pass
    except Exception:
        pass

    return JsonResponse([format_product(p, ratings_map) for p in qs], safe=False)

@csrf_exempt
def get_admin_products(request):
    check_and_seed()
    if request.method == 'GET':
        qs = Product.objects.all()
        # Bulk prefetch product ratings
        ratings_map = {}
        try:
            orders_qs = Order.objects.exclude(reviews__isnull=True).exclude(reviews="")
            for o in orders_qs:
                try:
                    rev_dict = json.loads(o.reviews) if isinstance(o.reviews, str) else o.reviews
                    if isinstance(rev_dict, dict):
                        for prod_id, rev_data in rev_dict.items():
                            rating = int(rev_data.get("rating", 5))
                            if prod_id not in ratings_map:
                                ratings_map[prod_id] = []
                            ratings_map[prod_id].append(rating)
                except Exception:
                    pass
        except Exception:
            pass
        return JsonResponse([format_product(p, ratings_map) for p in qs], safe=False)
    elif request.method == 'POST':
        try:
            body = json.loads(request.body)
            p_id = 'luxe-' + str(random.randint(100, 9999))
            
            p = Product.objects.create(
                id=p_id,
                name=body.get('name', 'Unnamed Designer Piece'),
                category=body.get('category', 'Women'),
                brand=body.get('brand', 'Zara'),
                price=float(body.get('price', 0.0)),
                originalPrice=float(body.get('originalPrice', 0.0)),
                discount=float(body.get('discount', 0.0)),
                costPrice=float(body.get('costPrice', 0.0)),
                sku=body.get('sku', f"SKU-{p_id.upper()}"),
                barcode=body.get('barcode', str(random.randint(100000000000, 999999999999))),
                description=body.get('description', ''),
                material=body.get('material') or body.get('fabric') or '',
                stock=int(body.get('stock', 0)),
                inStock=1 if int(body.get('stock', 0)) > 0 else 0,
                weight=float(body.get('weight', 0.0)),
                dimensions=body.get('dimensions', ''),
                status=body.get('status', 'active'),
                tag=body.get('tag', ''),
                occasion=body.get('occasion', ''),
                trending=int(body.get('trending', 0)),
                featured=int(body.get('featured', 0)),
                bestSeller=int(body.get('bestSeller', 0)),
                newArrival=int(body.get('newArrival', 0)),
                limitedEdition=int(body.get('limitedEdition', 0)),
                categoryGroup=body.get('categoryGroup', ''),
                subcategory=body.get('subcategory', ''),
                productType=body.get('productType', ''),
                images=json.dumps(body.get('images', [])),
                sizes=json.dumps(body.get('sizes', ['S', 'M', 'L'])),
                colors=json.dumps(body.get('colors', ['#ffffff'])),
                details=json.dumps(body.get('details', [])),
                videoUrl=body.get('videoUrl', ''),
                seoKeywords=json.dumps({
                    "slug": body.get("slug", ""),
                    "seoTitle": body.get("seoTitle", ""),
                    "metaDescription": body.get("metaDescription", ""),
                    "seoKeywords": body.get("seoKeywords", "")
                })
            )
            return JsonResponse({"success": True, "id": p_id})
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    return JsonResponse({"error": "Method not allowed"}, status=405)

def get_product_detail(request, product_id):
    try:
        p = Product.objects.get(id=product_id)
        return JsonResponse(format_product(p))
    except Product.DoesNotExist:
        return JsonResponse({"error": "Product not found"}, status=404)

@csrf_exempt
def modify_product(request, product_id):
    if request.method == 'PUT':
        try:
            body = json.loads(request.body)
            p = Product.objects.get(id=product_id)
            p.name = body.get('name', p.name)
            p.category = body.get('category', p.category)
            p.brand = body.get('brand', p.brand)
            p.price = float(body.get('price', p.price))
            p.originalPrice = float(body.get('originalPrice', p.originalPrice))
            p.discount = float(body.get('discount', p.discount))
            p.costPrice = float(body.get('costPrice', p.costPrice))
            p.sku = body.get('sku', p.sku)
            p.barcode = body.get('barcode', p.barcode)
            p.description = body.get('description', p.description)
            p.material = body.get('material') or body.get('fabric') or p.material
            p.stock = int(body.get('stock', p.stock))
            p.inStock = 1 if p.stock > 0 else 0
            p.weight = float(body.get('weight', p.weight))
            p.dimensions = body.get('dimensions', p.dimensions)
            p.status = body.get('status', p.status)
            p.tag = body.get('tag', p.tag)
            p.occasion = body.get('occasion', p.occasion)
            p.trending = int(body.get('trending', p.trending))
            p.featured = int(body.get('featured', p.featured))
            p.bestSeller = int(body.get('bestSeller', p.bestSeller))
            p.newArrival = int(body.get('newArrival', p.newArrival))
            p.limitedEdition = int(body.get('limitedEdition', p.limitedEdition))
            p.categoryGroup = body.get('categoryGroup', p.categoryGroup)
            p.subcategory = body.get('subcategory', p.subcategory)
            p.productType = body.get('productType', p.productType)
            
            if 'images' in body:
                p.images = json.dumps(body['images'])
            if 'sizes' in body:
                p.sizes = json.dumps(body['sizes'])
            if 'colors' in body:
                p.colors = json.dumps(body['colors'])
            if 'details' in body:
                p.details = json.dumps(body['details'])
            if 'videoUrl' in body:
                p.videoUrl = body['videoUrl']
                
            existing_slug = ""
            existing_title = ""
            existing_desc = ""
            existing_kw = p.seoKeywords or ""
            if existing_kw.startswith("{") and existing_kw.endswith("}"):
                try:
                    js = json.loads(existing_kw)
                    existing_slug = js.get("slug", "")
                    existing_title = js.get("seoTitle", "")
                    existing_desc = js.get("metaDescription", "")
                    existing_kw = js.get("seoKeywords", "")
                except Exception:
                    pass
            
            seo_data = {
                "slug": body.get("slug", existing_slug),
                "seoTitle": body.get("seoTitle", existing_title),
                "metaDescription": body.get("metaDescription", existing_desc),
                "seoKeywords": body.get("seoKeywords", existing_kw)
            }
            p.seoKeywords = json.dumps(seo_data)
                
            p.save()
            return JsonResponse({"success": True})
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
            
    elif request.method == 'DELETE':
        try:
            Product.objects.filter(id=product_id).delete()
            return JsonResponse({"success": True})
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
            
    return JsonResponse({"error": "Method not allowed"}, status=405)

@csrf_exempt
def get_products_root(request):
    # Fallback endpoint if needed
    return get_products(request)

# 2. CATEGORIES API
@csrf_exempt
def categories(request):
    check_and_seed()
    if request.method == 'GET':
        qs = Category.objects.all()
        data = []
        for c in qs:
            img_val = c.image or ""
            featured = False
            show_on_homepage = False
            sort_order = 0
            description = ""
            
            if img_val.startswith("{") and img_val.endswith("}"):
                try:
                    meta = json.loads(img_val)
                    img_val = meta.get("image", "")
                    featured = meta.get("featured", False)
                    show_on_homepage = meta.get("showOnHomepage", False)
                    sort_order = int(meta.get("sortOrder", 0))
                    description = meta.get("description", "")
                except Exception:
                    pass
            
            data.append({
                "id": c.id,
                "name": c.name,
                "parentCategory": c.parentCategory,
                "slug": c.slug,
                "status": c.status,
                "image": img_val,
                "featured": featured,
                "showOnHomepage": show_on_homepage,
                "sortOrder": sort_order,
                "description": description
            })
        return JsonResponse(data, safe=False)
    elif request.method == 'POST':
        try:
            body = json.loads(request.body)
            c_id = body.get('id') or ('cat-' + str(random.randint(100, 999)))
            
            meta_image = json.dumps({
                "image": body.get("image", ""),
                "featured": bool(body.get("featured", False)),
                "showOnHomepage": bool(body.get("showOnHomepage", False)),
                "sortOrder": int(body.get("sortOrder") or 0),
                "description": body.get("description", "")
            })
            
            Category.objects.update_or_create(
                id=c_id,
                defaults={
                    "name": body.get('name'),
                    "parentCategory": body.get('parentCategory', 'None'),
                    "slug": body.get('slug', 'default'),
                    "status": body.get('status', 'active'),
                    "image": meta_image
                }
            )
            return JsonResponse({"success": True, "id": c_id})
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    elif request.method == 'DELETE':
        try:
            cat_id = request.GET.get('id')
            if cat_id:
                Category.objects.filter(id=cat_id).delete()
                return JsonResponse({"success": True})
            return JsonResponse({"error": "Missing category id"}, status=400)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    return JsonResponse({"error": "Method not allowed"}, status=405)

# 3. ORDERS API
@csrf_exempt
def orders(request):
    check_and_seed()
    if request.method == 'GET':
        email = request.GET.get('email')
        qs = Order.objects.all()
        if email:
            qs = qs.filter(email=email)
        qs = qs.order_by('-created_at')
        
        data = []
        for o in qs:
            try:
                ret_req = json.loads(o.returnRequest) if o.returnRequest else {}
            except Exception:
                ret_req = {}
            try:
                exch_req = json.loads(o.exchangeRequest) if o.exchangeRequest else {}
            except Exception:
                exch_req = {}
            try:
                revs = json.loads(o.reviews) if o.reviews else {}
            except Exception:
                revs = {}
                
            data.append({
                "id": o.id,
                "date": o.date,
                "customerName": o.customerName,
                "email": o.email,
                "total": o.total,
                "status": o.status,
                "paymentStatus": o.paymentStatus,
                "deliveryMethod": o.deliveryMethod,
                "trackingNumber": o.trackingNumber,
                "deliveryDate": o.deliveryDate,
                "returnRequest": ret_req,
                "exchangeRequest": exch_req,
                "reviews": revs,
                "itemsCount": o.itemsCount,
                "items": json.loads(o.items or "[]"),
                "createdAt": o.created_at.isoformat() if o.created_at else ""
            })
        return JsonResponse(data, safe=False)
        
    elif request.method == 'POST':
        try:
            body = json.loads(request.body)
            o_id = body.get('id') or ('ord-' + str(random.randint(100, 999)))
            import datetime
            date_str = datetime.date.today().isoformat()
            
            Order.objects.create(
                id=o_id,
                date=date_str,
                customerName=body.get('customerName'),
                email=body.get('email'),
                total=float(body.get('total')),
                status='pending',
                paymentStatus=body.get('paymentStatus', 'paid'),
                deliveryMethod=body.get('deliveryMethod', 'Standard Delivery'),
                trackingNumber=body.get('trackingNumber'),
                itemsCount=int(body.get('itemsCount', 1)),
                items=json.dumps(body.get('items', []))
            )
            
            # Reduce product stock
            items = body.get('items', [])
            for item in items:
                p_id = item.get('productId')
                qty = int(item.get('quantity', 1))
                try:
                    p = Product.objects.get(id=p_id)
                    p.stock = max(0, p.stock - qty)
                    p.inStock = 1 if p.stock > 0 else 0
                    p.save()
                except Product.DoesNotExist:
                    pass
            
            # Get dynamic supercoins multiplier
            try:
                loyalty_setting = Setting.objects.get(key="supercoin_reward_percentage")
                points_ratio = float(loyalty_setting.value) / 100.0
            except Exception:
                points_ratio = 0.25

            # Sync customer registration in CRM
            customer_email = body.get('email')
            customer_name = body.get('customerName') or customer_email.split('@')[0]
            points_earned = int(float(body.get('total')) * points_ratio)
            
            cust, created = Customer.objects.get_or_create(
                email=customer_email,
                defaults={
                    "id": f"cust-{random.randint(1000, 9999)}",
                    "name": customer_name,
                    "ordersCount": 1,
                    "points": 0,
                    "status": "active"
                }
            )
            if not created:
                cust.ordersCount = cust.ordersCount + 1
                cust.save()
            
            return JsonResponse({"success": True, "id": o_id})
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
            
    return JsonResponse({"error": "Method not allowed"}, status=405)

def get_admin_orders(request):
    check_and_seed()
    qs = Order.objects.all().order_by('-created_at')
    data = []
    for o in qs:
        try:
            ret_req = json.loads(o.returnRequest) if o.returnRequest else {}
        except Exception:
            ret_req = {}
        try:
            exch_req = json.loads(o.exchangeRequest) if o.exchangeRequest else {}
        except Exception:
            exch_req = {}
        try:
            revs = json.loads(o.reviews) if o.reviews else {}
        except Exception:
            revs = {}

        data.append({
            "id": o.id,
            "date": o.date,
            "customerName": o.customerName,
            "email": o.email,
            "total": o.total,
            "status": o.status,
            "paymentStatus": o.paymentStatus,
            "deliveryMethod": o.deliveryMethod,
            "trackingNumber": o.trackingNumber,
            "deliveryDate": o.deliveryDate,
            "returnRequest": ret_req,
            "exchangeRequest": exch_req,
            "reviews": revs,
            "itemsCount": o.itemsCount,
            "items": json.loads(o.items or "[]"),
            "createdAt": o.created_at.isoformat() if o.created_at else ""
        })
    return JsonResponse(data, safe=False)

@csrf_exempt
def modify_order(request, order_id):
    if request.method == 'PUT':
        try:
            body = json.loads(request.body)
            o = Order.objects.get(id=order_id)
            
            # Automatically set deliveryDate and credit super coins if status is changing to completed or delivered
            new_status = body.get('status', o.status)
            if new_status.lower() in ['completed', 'delivered'] and o.status.lower() not in ['completed', 'delivered']:
                if not o.deliveryDate:
                    import datetime
                    o.deliveryDate = datetime.date.today().isoformat()
                
                # Credit super coins to Customer now since the order is delivered
                try:
                    loyalty_setting = Setting.objects.get(key="supercoin_reward_percentage")
                    points_ratio = float(loyalty_setting.value) / 100.0
                except Exception:
                    points_ratio = 0.25
                
                points_earned = int(float(o.total) * points_ratio)
                cust, created = Customer.objects.get_or_create(
                    email=o.email,
                    defaults={
                        "id": f"cust-{random.randint(1000, 9999)}",
                        "name": o.customerName,
                        "ordersCount": 1,
                        "points": points_earned,
                        "status": "active"
                    }
                )
                if not created:
                    cust.points = cust.points + points_earned
                    cust.save()
                
            o.status = new_status
            o.paymentStatus = body.get('paymentStatus', o.paymentStatus)
            o.trackingNumber = body.get('trackingNumber', o.trackingNumber)
            o.deliveryMethod = body.get('deliveryMethod', o.deliveryMethod)
            
            if 'deliveryDate' in body:
                o.deliveryDate = body.get('deliveryDate')
            if 'returnRequest' in body:
                o.returnRequest = json.dumps(body.get('returnRequest')) if isinstance(body.get('returnRequest'), (dict, list)) else body.get('returnRequest')
            if 'exchangeRequest' in body:
                o.exchangeRequest = json.dumps(body.get('exchangeRequest')) if isinstance(body.get('exchangeRequest'), (dict, list)) else body.get('exchangeRequest')
            if 'reviews' in body:
                o.reviews = json.dumps(body.get('reviews')) if isinstance(body.get('reviews'), (dict, list)) else body.get('reviews')
                
            o.save()
            return JsonResponse({"success": True})
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    return JsonResponse({"error": "Method not allowed"}, status=405)

@csrf_exempt
def modify_customer(request, customer_id):
    if request.method == 'PUT':
        try:
            body = json.loads(request.body)
            c = Customer.objects.get(id=customer_id)
            
            if 'status' in body and body['status'] is not None:
                c.status = body['status']
            if 'points' in body and body['points'] is not None:
                try:
                    c.points = int(body['points'])
                except (ValueError, TypeError):
                    pass
            if 'ordersCount' in body and body['ordersCount'] is not None:
                try:
                    c.ordersCount = int(body['ordersCount'])
                except (ValueError, TypeError):
                    pass
            if 'name' in body and body['name'] is not None:
                c.name = body['name']
            if 'address' in body and body['address'] is not None:
                c.address = body['address']
                
            c.save()
            return JsonResponse({"success": True})
        except Customer.DoesNotExist:
            return JsonResponse({"error": "Customer not found"}, status=404)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    return JsonResponse({"error": "Method not allowed"}, status=405)

# 4. CUSTOMERS API
def get_admin_customers(request):
    check_and_seed()
    qs = Customer.objects.all()
    data = [{"id": c.id, "name": c.name, "email": c.email, "points": c.points, "ordersCount": c.ordersCount, "address": c.address, "status": c.status} for c in qs]
    return JsonResponse(data, safe=False)

# 5. SETTINGS API
@csrf_exempt
def admin_settings(request):
    check_and_seed()
    # Mock settings handler
    if request.method == 'GET':
        qs = Setting.objects.all()
        data = {s.key: s.value for s in qs}
        return JsonResponse(data)
    elif request.method == 'PUT':
        try:
            body = json.loads(request.body)
            for k, v in body.items():
                Setting.objects.update_or_create(key=k, defaults={"value": str(v)})
            return JsonResponse({"success": True})
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    return JsonResponse({"error": "Method not allowed"}, status=405)

# 6. BRANDS API
@csrf_exempt
def brands(request):
    if request.method == 'GET':
        qs = Brand.objects.all()
        data = []
        for b in qs:
            desc = ""
            banner = ""
            website = ""
            country = ""
            founded = 1970
            b_type = "Luxury"
            featured = False
            show_on_homepage = False
            seo_kw = b.seoKeywords or ""
            
            if seo_kw.startswith("{") and seo_kw.endswith("}"):
                try:
                    js = json.loads(seo_kw)
                    desc = js.get("description", "")
                    banner = js.get("banner", "")
                    website = js.get("website", "")
                    country = js.get("country", "")
                    founded = int(js.get("founded", 1970))
                    b_type = js.get("type", "Luxury")
                    featured = js.get("featured", False)
                    show_on_homepage = js.get("showOnHomepage", False)
                    seo_kw = js.get("seoKeywords", "")
                except Exception:
                    pass
            
            data.append({
                "id": b.id,
                "name": b.name,
                "slug": b.slug,
                "logo": b.logo,
                "status": b.status,
                "seoTitle": b.seoTitle or "",
                "metaDescription": b.metaDescription or "",
                "seoKeywords": seo_kw,
                "description": desc,
                "banner": banner,
                "website": website,
                "country": country,
                "founded": founded,
                "type": b_type,
                "featured": featured,
                "showOnHomepage": show_on_homepage
            })
        return JsonResponse(data, safe=False)
    
    elif request.method == 'POST':
        try:
            body = json.loads(request.body)
            brand_id = body.get('id') or f"br-{random.randint(1000, 9999)}"
            
            seo_data = json.dumps({
                "description": body.get("description", ""),
                "banner": body.get("banner", ""),
                "website": body.get("website", ""),
                "country": body.get("country", ""),
                "founded": int(body.get("founded", 1970)),
                "type": body.get("type", "Luxury"),
                "featured": bool(body.get("featured", False)),
                "showOnHomepage": bool(body.get("showOnHomepage", False)),
                "seoKeywords": body.get("seoKeywords", "")
            })
            
            brand, created = Brand.objects.update_or_create(
                id=brand_id,
                defaults={
                    "name": body.get('name', ''),
                    "slug": body.get('slug', ''),
                    "logo": body.get('logo', 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=100'),
                    "status": body.get('status', 'active'),
                    "seoTitle": body.get('seoTitle', ''),
                    "metaDescription": body.get('metaDescription', ''),
                    "seoKeywords": seo_data
                }
            )
            return JsonResponse({"success": True, "brand": {"id": brand.id, "name": brand.name}})
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
            
    elif request.method == 'DELETE':
        try:
            brand_id = request.GET.get('id')
            Brand.objects.filter(id=brand_id).delete()
            return JsonResponse({"success": True})
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
            
    return JsonResponse({"error": "Method not allowed"}, status=405)


# 7. COUPONS API
@csrf_exempt
def coupons(request):
    if request.method == 'GET':
        qs = Coupon.objects.all()
        data = [{
            "id": c.id,
            "code": c.code,
            "type": c.type,
            "value": c.value,
            "minPurchase": c.minPurchase,
            "requiredSupercoins": c.requiredSupercoins,
            "startDate": c.startDate,
            "endDate": c.endDate,
            "status": c.status,
            "usageCount": c.usageCount
        } for c in qs]
        return JsonResponse(data, safe=False)
        
    elif request.method == 'POST':
        try:
            body = json.loads(request.body)
            coupon_id = body.get('id') or f"c-{random.randint(1000, 9999)}"
            coupon, created = Coupon.objects.update_or_create(
                id=coupon_id,
                defaults={
                    "code": body.get('code', ''),
                    "type": body.get('type', 'percentage'),
                    "value": float(body.get('value', 0)),
                    "minPurchase": float(body.get('minPurchase', 0)),
                    "requiredSupercoins": int(body.get('requiredSupercoins', 0)),
                    "startDate": body.get('startDate', ''),
                    "endDate": body.get('endDate', ''),
                    "status": body.get('status', 'active'),
                    "usageCount": int(body.get('usageCount', 0))
                }
            )
            return JsonResponse({"success": True, "coupon": {"id": coupon.id, "code": coupon.code}})
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
            
    elif request.method == 'DELETE':
        try:
            coupon_id = request.GET.get('id')
            Coupon.objects.filter(id=coupon_id).delete()
            return JsonResponse({"success": True})
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
            
    return JsonResponse({"error": "Method not allowed"}, status=405)


# 8. REVIEWS API
@csrf_exempt
def reviews(request):
    if request.method == 'GET':
        qs = Review.objects.all()
        data = [{
            "id": r.id,
            "customerName": r.customerName,
            "productName": r.productName,
            "rating": r.rating,
            "comment": r.comment,
            "date": r.date,
            "status": r.status
        } for r in qs]
        return JsonResponse(data, safe=False)
        
    elif request.method == 'POST':
        try:
            body = json.loads(request.body)
            review_id = body.get('id') or f"rev-{random.randint(1000, 9999)}"
            review, created = Review.objects.update_or_create(
                id=review_id,
                defaults={
                    "customerName": body.get('customerName', ''),
                    "productName": body.get('productName', ''),
                    "rating": int(body.get('rating', 5)),
                    "comment": body.get('comment', ''),
                    "date": body.get('date', '2026-07-11'),
                    "status": body.get('status', 'pending')
                }
            )
            return JsonResponse({"success": True, "review": {"id": review.id, "status": review.status}})
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
            
    elif request.method == 'DELETE':
        try:
            review_id = request.GET.get('id')
            Review.objects.filter(id=review_id).delete()
            return JsonResponse({"success": True})
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
            
    return JsonResponse({"error": "Method not allowed"}, status=405)


# 9. ANALYTICS API
def analytics(request):
    if request.method == 'GET':
        total_sales = sum(ord.total for ord in Order.objects.exclude(status='cancelled'))
        total_orders = Order.objects.count()
        total_products = Product.objects.count()
        total_customers = Customer.objects.count()
        
        # Calculate category distribution dynamically
        cat_counts = {}
        for p in Product.objects.all():
            cat = p.category or 'Other'
            cat_counts[cat] = cat_counts.get(cat, 0) + 1
            
        category_distribution = [{"category": k, "count": v} for k, v in cat_counts.items()]
        
        # Generate some sales history dynamically from orders
        orders_by_date = {}
        for ord in Order.objects.all():
            date = ord.date or '2026-07-11'
            orders_by_date[date] = orders_by_date.get(date, 0) + ord.total
            
        sales_history = [{"date": k, "revenue": v} for k, v in sorted(orders_by_date.items())]
        if not sales_history:
            sales_history = [{"date": "2026-07-10", "revenue": 1200}, {"date": "2026-07-11", "revenue": 890}]
            
        low_stock = [{
            "id": p.id,
            "name": p.name,
            "stock": p.stock
        } for p in Product.objects.filter(stock__lt=10)]

        data = {
            "totalSales": total_sales,
            "totalOrders": total_orders,
            "totalProducts": total_products,
            "totalCustomers": total_customers,
            "categoryDistribution": category_distribution,
            "salesHistory": sales_history,
            "lowStockAlerts": low_stock
        }
        return JsonResponse(data)
        
    return JsonResponse({"error": "Method not allowed"}, status=405)


def product_reviews(request, product_id):
    check_and_seed()
    orders_qs = Order.objects.exclude(reviews__isnull=True).exclude(reviews="")
    results = []
    for o in orders_qs:
        try:
            rev_dict = json.loads(o.reviews) if isinstance(o.reviews, str) else o.reviews
            if not isinstance(rev_dict, dict):
                continue
            if product_id in rev_dict:
                rev = rev_dict[product_id]
                results.append({
                    "customerName": o.customerName,
                    "rating": int(rev.get("rating", 5)),
                    "reviewText": rev.get("reviewText", ""),
                    "date": rev.get("date", o.date),
                    "photos": rev.get("photos", []),
                    "video": rev.get("video", "")
                })
        except Exception as e:
            print("Error parsing order reviews:", e)
    return JsonResponse(results, safe=False)

@csrf_exempt
def support_tickets(request):
    if request.method == 'GET':
        email = request.GET.get('email')
        if email:
            qs = SupportTicket.objects.filter(customerEmail=email)
        else:
            qs = SupportTicket.objects.all()
        data = [{
            "id": t.id,
            "customerEmail": t.customerEmail,
            "customerName": t.customerName,
            "message": t.message,
            "status": t.status,
            "date": t.date
        } for t in qs]
        return JsonResponse(data, safe=False)

    elif request.method == 'POST':
        try:
            body = json.loads(request.body)
            ticket_id = body.get('id') or f"TKT-{random.randint(100000, 999999)}"
            ticket, created = SupportTicket.objects.update_or_create(
                id=ticket_id,
                defaults={
                    "customerEmail": body.get('customerEmail', ''),
                    "customerName": body.get('customerName', ''),
                    "message": body.get('message', ''),
                    "status": body.get('status', 'Pending Verification'),
                    "date": body.get('date', '')
                }
            )
            return JsonResponse({"success": True, "ticket": {
                "id": ticket.id,
                "customerEmail": ticket.customerEmail,
                "customerName": ticket.customerName,
                "message": ticket.message,
                "status": ticket.status,
                "date": ticket.date
            }})
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    elif request.method == 'PUT':
        try:
            body = json.loads(request.body)
            ticket_id = body.get('id')
            status = body.get('status')
            SupportTicket.objects.filter(id=ticket_id).update(status=status)
            return JsonResponse({"success": True})
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "Method not allowed"}, status=405)

@csrf_exempt
def support_messages(request):
    if request.method == 'GET':
        order_id = request.GET.get('orderId')
        if order_id:
            qs = SupportMessage.objects.filter(orderId=order_id).order_by('timestamp')
        else:
            qs = SupportMessage.objects.all().order_by('-timestamp')[:10]
        data = [{
            "id": m.id,
            "orderId": m.orderId,
            "sender": m.sender,
            "text": m.text,
            "timestamp": m.timestamp.isoformat()
        } for m in qs]
        return JsonResponse(data, safe=False)

    elif request.method == 'POST':
        try:
            body = json.loads(request.body)
            order_id = body.get('orderId')
            sender = body.get('sender')
            text = body.get('text')
            if not order_id or not sender or not text:
                return JsonResponse({"error": "Missing orderId, sender, or text"}, status=400)
            m = SupportMessage.objects.create(
                orderId=order_id,
                sender=sender,
                text=text
            )
            return JsonResponse({
                "success": True,
                "message": {
                    "id": m.id,
                    "orderId": m.orderId,
                    "sender": m.sender,
                    "text": m.text,
                    "timestamp": m.timestamp.isoformat()
                }
            })
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    elif request.method == 'DELETE':
        msg_id = request.GET.get('id')
        order_id = request.GET.get('orderId')
        if msg_id:
            SupportMessage.objects.filter(id=msg_id).delete()
            return JsonResponse({"success": True})
        elif order_id:
            SupportMessage.objects.filter(orderId=order_id).delete()
            return JsonResponse({"success": True})
        return JsonResponse({"error": "Missing id or orderId parameter"}, status=400)

    return JsonResponse({"error": "Method not allowed"}, status=405)
