from django.urls import path
from . import views

urlpatterns = [
    # Products
    path('api/products', views.get_products, name='get_products'),
    path('api/admin/products', views.get_admin_products, name='get_admin_products'),
    path('api/products/<str:product_id>', views.get_product_detail, name='get_product_detail'),
    path('api/products/<str:product_id>/reviews', views.product_reviews, name='product_reviews'),
    path('api/admin/products/<str:product_id>', views.modify_product, name='modify_product'),
    
    # Categories
    path('api/categories', views.categories, name='categories'),
    
    # Orders
    path('api/orders', views.orders, name='orders'),
    path('api/admin/orders', views.get_admin_orders, name='get_admin_orders'),
    path('api/admin/orders/<str:order_id>', views.modify_order, name='modify_order'),
    
    # Customers
    path('api/admin/customers', views.get_admin_customers, name='get_admin_customers'),
    path('api/admin/customers/<str:customer_id>', views.modify_customer, name='modify_customer'),
    
    # Settings
    path('api/admin/settings', views.admin_settings, name='admin_settings'),
    
    # Brands, Coupons, Reviews, Analytics
    path('api/admin/brands', views.brands, name='brands'),
    path('api/admin/coupons', views.coupons, name='coupons'),
    path('api/admin/reviews', views.reviews, name='reviews'),
    path('api/admin/analytics', views.analytics, name='analytics'),
    path('api/support-tickets', views.support_tickets, name='support_tickets'),
    path('api/support-messages', views.support_messages, name='support_messages'),
]
