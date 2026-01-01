from django.urls import path
from .views import *

urlpatterns = [
    path('', index, name='index'),
    path('api/transactions/', TransactionListCreate.as_view(), name='transaction-list'),
    path('api/transactions/<int:pk>/', TransactionDetail.as_view(), name='transaction-detail'),
    path('api/all_pnl/', all_pnl, name="all_pnl"),
    path('api/signup/', signup_view, name="signup"),
    path('api/login/', login_view, name="login"),
    path('api/logout/', logout_view, name="logout"),
    path('api/check-auth/', check_auth, name="check_auth")
]