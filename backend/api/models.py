from django.db import models

class Product(models.Model):
    id = models.CharField(max_length=100, primary_key=True)
    name = models.CharField(max_length=255)
    category = models.CharField(max_length=100)
    brand = models.CharField(max_length=100)
    price = models.FloatField()
    originalPrice = models.FloatField()
    discount = models.FloatField(default=0)
    costPrice = models.FloatField()
    sku = models.CharField(max_length=100, null=True, blank=True)
    barcode = models.CharField(max_length=100, null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    images = models.TextField(default="[]") # Stringified JSON array
    sizes = models.TextField(default="[]")  # Stringified JSON array
    colors = models.TextField(default="[]") # Stringified JSON array
    material = models.CharField(max_length=100, null=True, blank=True)
    stock = models.IntegerField(default=0)
    weight = models.FloatField(default=0)
    dimensions = models.CharField(max_length=100, null=True, blank=True)
    status = models.CharField(max_length=50, default='active')
    seoKeywords = models.TextField(null=True, blank=True)
    rating = models.FloatField(default=5.0)
    reviewsCount = models.IntegerField(default=0)
    inStock = models.IntegerField(default=1)
    trending = models.IntegerField(default=0)
    featured = models.IntegerField(default=0)
    bestSeller = models.IntegerField(default=0)
    newArrival = models.IntegerField(default=0)
    limitedEdition = models.IntegerField(default=0)
    tag = models.CharField(max_length=100, null=True, blank=True)
    occasion = models.CharField(max_length=100, null=True, blank=True)
    categoryGroup = models.CharField(max_length=100, null=True, blank=True)
    subcategory = models.CharField(max_length=100, null=True, blank=True)
    productType = models.CharField(max_length=100, null=True, blank=True)
    details = models.TextField(default="[]") # Stringified JSON array

class Category(models.Model):
    id = models.CharField(max_length=100, primary_key=True)
    name = models.CharField(max_length=255)
    parentCategory = models.CharField(max_length=100, default='None')
    slug = models.CharField(max_length=255)
    status = models.CharField(max_length=50, default='active')
    image = models.TextField(null=True, blank=True)

class Order(models.Model):
    id = models.CharField(max_length=100, primary_key=True)
    date = models.CharField(max_length=100)
    customerName = models.CharField(max_length=255)
    email = models.CharField(max_length=255)
    total = models.FloatField()
    status = models.CharField(max_length=50, default='pending')
    paymentStatus = models.CharField(max_length=50, default='unpaid')
    deliveryMethod = models.CharField(max_length=100, null=True, blank=True)
    trackingNumber = models.CharField(max_length=100, null=True, blank=True)
    itemsCount = models.IntegerField(default=0)
    items = models.TextField(default="[]") # Stringified JSON array
    deliveryDate = models.CharField(max_length=100, null=True, blank=True)
    returnRequest = models.TextField(default="{}")
    exchangeRequest = models.TextField(default="{}")
    reviews = models.TextField(default="{}")
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)

class Customer(models.Model):
    id = models.CharField(max_length=100, primary_key=True)
    name = models.CharField(max_length=255)
    email = models.CharField(max_length=255, unique=True)
    points = models.IntegerField(default=0)
    ordersCount = models.IntegerField(default=0)
    address = models.TextField(null=True, blank=True)
    status = models.CharField(max_length=50, default='active')

class Setting(models.Model):
    key = models.CharField(max_length=100, primary_key=True)
    value = models.TextField()

class Brand(models.Model):
    id = models.CharField(max_length=100, primary_key=True)
    name = models.CharField(max_length=255)
    slug = models.CharField(max_length=255)
    logo = models.TextField(null=True, blank=True)
    status = models.CharField(max_length=50, default='active')
    seoTitle = models.CharField(max_length=255, null=True, blank=True)
    metaDescription = models.TextField(null=True, blank=True)
    seoKeywords = models.TextField(null=True, blank=True)

class Coupon(models.Model):
    id = models.CharField(max_length=100, primary_key=True)
    code = models.CharField(max_length=50, unique=True)
    type = models.CharField(max_length=50, default='percentage')
    value = models.FloatField()
    minPurchase = models.FloatField(default=0)
    requiredSupercoins = models.IntegerField(default=0)
    startDate = models.CharField(max_length=100)
    endDate = models.CharField(max_length=100)
    status = models.CharField(max_length=50, default='active')
    usageCount = models.IntegerField(default=0)

class Review(models.Model):
    id = models.CharField(max_length=100, primary_key=True)
    productName = models.CharField(max_length=255)
    customerName = models.CharField(max_length=255)
    rating = models.IntegerField(default=5)
    comment = models.TextField(null=True, blank=True)
    date = models.CharField(max_length=100)
    status = models.CharField(max_length=50, default='pending')

class SupportTicket(models.Model):
    id = models.CharField(max_length=100, primary_key=True)
    customerEmail = models.CharField(max_length=255)
    customerName = models.CharField(max_length=255)
    message = models.TextField()
    status = models.CharField(max_length=50, default='Pending Verification')
    date = models.CharField(max_length=100)

class SupportMessage(models.Model):
    id = models.AutoField(primary_key=True)
    orderId = models.CharField(max_length=100)
    sender = models.CharField(max_length=50) # 'user' or 'agent'
    text = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
