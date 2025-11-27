
import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AppContext } from '../context/AppContext';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import StoreScreen from '../screens/StoreScreen';
import ProductsScreen from '../screens/ProductsScreen';
import ProductFormScreen from '../screens/ProductFormScreen';
import CategoriesScreen from '../screens/CategoriesScreen';
import CategoryFormScreen from '../screens/CategoryFormScreen';
import UsersScreen from '../screens/UsersScreen';
import UserFormScreen from '../screens/UserFormScreen';
import LogsScreen from '../screens/LogsScreen';
import { Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../theme';

// ⬇️ USA UNO: Expo
import { Ionicons } from '@expo/vector-icons';
// ⬇️ O React Native CLI
// import Ionicons from 'react-native-vector-icons/Ionicons';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary.main,
        tabBarInactiveTintColor: '#777',
        tabBarStyle: { height: 60 },
        tabBarLabelStyle: { fontSize: 12, marginBottom: 6 },
        tabBarIcon: ({ color, focused }) => {
          const icons = {
            Tienda: focused ? 'cart' : 'cart-outline',
            Productos: focused ? 'cube' : 'cube-outline',
            Categorias: focused ? 'list' : 'list-outline',
            Usuarios: focused ? 'people' : 'people-outline',
            Logs: focused ? 'time' : 'time-outline',
          };
          const name = icons[route.name] || 'ellipse-outline';
          return <Ionicons name={name} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Tienda" component={StoreScreen} />
      <Tab.Screen name="Productos" component={ProductsStack} />
      <Tab.Screen name="Categorias" component={CategoriesStack} />
      <Tab.Screen name="Usuarios" component={UsersStack} />
      <Tab.Screen name="Logs" component={LogsScreen} />
    </Tab.Navigator>
  );
}

const ProductsStackNav = createStackNavigator();
function ProductsStack() {
  return (
    <ProductsStackNav.Navigator>
      <ProductsStackNav.Screen name="ProductsList" component={ProductsScreen} options={{ headerShown: false }} />
      <ProductsStackNav.Screen name="ProductForm" component={ProductFormScreen} options={{ title: 'Producto' }} />
    </ProductsStackNav.Navigator>
  );
}

const CategoriesStackNav = createStackNavigator();
function CategoriesStack() {
  return (
    <CategoriesStackNav.Navigator>
      <CategoriesStackNav.Screen name="CategoriesList" component={CategoriesScreen} options={{ headerShown: false }} />
      <CategoriesStackNav.Screen name="CategoryForm" component={CategoryFormScreen} options={{ title: 'Categoría' }} />
    </CategoriesStackNav.Navigator>
  );
}

const UsersStackNav = createStackNavigator();
function UsersStack() {
  return (
    <UsersStackNav.Navigator>
      <UsersStackNav.Screen name="UsersList" component={UsersScreen} options={{ headerShown: false }} />
      <UsersStackNav.Screen name="UserForm" component={UserFormScreen} options={{ title: 'Usuario' }} />
    </UsersStackNav.Navigator>
  );
}

export default function AppNavigator() {
  const { token, loading, logout } = useContext(AppContext);

  if (loading) return <Text>Cargando...</Text>;

  const AuthStackNav = createStackNavigator();
  function AuthStack() {
    return (
      <AuthStackNav.Navigator>
        <AuthStackNav.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <AuthStackNav.Screen name="Register" component={RegisterScreen} options={{ title: 'Crear cuenta' }} />
      </AuthStackNav.Navigator>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {token ? (
          <Stack.Screen
            name="Main"
            component={MainTabs}
            options={{
              headerShown: true,
              title: 'E-Commerce',
              headerStyle: { backgroundColor: colors.primary.main },
              headerTintColor: colors.primary.contrastText,
              headerLeft: () => (
                <View style={{ marginLeft: 12 }}>
                  <Ionicons name="storefront-outline" size={22} color={colors.primary.contrastText} />
                </View>
              ),
              headerRight: () => (
                <TouchableOpacity
                  onPress={() => logout()}
                  style={{ marginRight: 12, flexDirection: 'row', alignItems: 'center', gap: 8 }}
                >
                  <Ionicons name="log-out-outline" size={20} color={colors.primary.contrastText} />
                  <Text style={{ color: colors.primary.contrastText, fontWeight: '600' }}>Salir</Text>
                </TouchableOpacity>
              ),
            }}
          />
        ) : (
          <Stack.Screen name="Auth" component={AuthStack} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
