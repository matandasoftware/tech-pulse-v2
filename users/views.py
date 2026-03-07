"""
Views for users app.
"""

from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from .models import CustomUser
from .serializers import (
    UserSerializer,
    UserRegistrationSerializer,
    UserUpdateSerializer
)


class UserRegistrationView(generics.CreateAPIView):
    """
    User registration endpoint.

    POST /api/auth/register/
    """

    queryset = CustomUser.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        """Create user and return token."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Create token for new user
        token = Token.objects.create(user=user)

        return Response({
            'token': token.key,
            'user': UserSerializer(user).data,
        }, status=status.HTTP_201_CREATED)


class UserLoginView(APIView):
    """
    User login endpoint.

    POST /api/auth/token/
    """

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        """Authenticate user and return token."""
        username = request.data.get('username')
        password = request.data.get('password')

        if not username or not password:
            return Response(
                {'detail': 'Please provide both username and password'},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = authenticate(username=username, password=password)

        if not user:
            return Response(
                {'detail': 'Invalid credentials'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        if not user.is_active:
            return Response(
                {'detail': 'Account is disabled'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # Get or create token for user
        token, created = Token.objects.get_or_create(user=user)

        return Response({
            'token': token.key,
            'user': UserSerializer(user).data,
        })


class UserProfileView(generics.RetrieveUpdateAPIView):
    """
    Get or update user profile.
    
    GET /api/users/profile/
    PATCH /api/users/profile/
    """
    
    serializer_class = UserUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        """Return current authenticated user."""
        return self.request.user
    
    def retrieve(self, request, *args, **kwargs):
        """Get user profile with full details."""
        instance = self.get_object()
        serializer = UserSerializer(instance)
        return Response(serializer.data)


class UserLogoutView(APIView):
    """
    User logout endpoint.

    POST /api/auth/logout/
    """

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        """Delete user's token."""
        try:
            # Delete the user's token
            Token.objects.filter(user=request.user).delete()

            return Response(
                {'message': 'Successfully logged out'},
                status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )