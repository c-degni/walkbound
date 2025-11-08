import HomeScreen from './src/screens/HomeScreen';
import FriendsScreen from './src/screens/FriendsScreen';
import BossFightScreen from './src/screens/BossFightScreen';
import LoginScreen from './src/screens/LoginScreen';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const requestHealthPerms = () => {
    const permissions = {
        permissions: {
            read: ['StepCount'],
            write: []
        }
    };
    
    AppleHealthKit.initHealthKit(permissions, (err) => {
        if (err) {
            Alert.alert(
                'Health Access Required',
                'This app needs to your step data to track your fitness progress.',
                [{ text: 'OK' }]
            );
        }
    });
};

function MainTabs() {
    return (
        <Tab.Navigator>
            <Tab.Screen name='Home' component={HomeScreen}/>
            <Tab.Screen name='Character' component={CharacterScreen}/>
            <Tab.Screen name='Friends' component={FriendsScreen}/>
            <Tab.Screen name='Boss' component={BossFightScreen}/>
        </Tab.Navigator>
    )
}

export default function App() {
    useEffect(() => {
        requestHealthPerms();
    }, []);

    return (
        <NavigationContainer>
            <Stack.Navigator>
                <Stack.Screen name='Login' component={LoginScreen}/>
                <Stack.Screen name='Main' component={MainTabs}/>
            </Stack.Navigator>
        </NavigationContainer>
    );
}

