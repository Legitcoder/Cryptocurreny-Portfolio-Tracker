import React from 'react';
import { StyleSheet, Text, View, Platform } from 'react-native';
import CardStackStyleInterpolator from 'react-navigation/src/views/CardStack/CardStackStyleInterpolator';
import { createBottomTabNavigator, createStackNavigator } from 'react-navigation';
import { Provider } from 'react-redux';
import store from './store';
import cryptocurrencies from 'cryptocurrencies';
import _ from 'lodash';

//import TransactionButton from './common/TransactionButton';
import PorfolioScreen from './screens/PortfolioScreen';
import SettingsScreen from './screens/SettingsScreen';
import WatchlistScreen from './screens/WatchlistScreen';
import AddToPortfolioScreen from './screens/AddToPortfolioScreen';

console.ignoredYellowBox = ['Remote debugger'];

var cryptos = _.invert(cryptocurrencies);
export const coins = Object.entries(cryptos).map(([coinName, symbol]) => ({coinName,symbol}));
coins.pop();





export default class App extends React.Component {
  render() {
    const MainNavigator = createBottomTabNavigator({
      portfolio: {
        screen: createStackNavigator( {
          portfolio: { screen: PorfolioScreen },
          addtoporfolio: { screen: AddToPortfolioScreen }
        },
        {
          transitionConfig: () => ({
            screenInterpolator: sceneProps => {
              return CardStackStyleInterpolator.forHorizontal(sceneProps);
            }
          }),
        }
      )
      },
      watchlist: { screen: WatchlistScreen},
      settings: { screen: SettingsScreen }
    },
      {
        swipeEnabled: false,
        tabBarOptions: {
          labelStyle: { fontSize: 20 }
        }
      }
  )



    return (
    <Provider store={store}>   
      <View style={styles.container}>
        <MainNavigator />
      </View>
      </Provider>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#282E33',
    marginTop: Platform.OS === 'android' ? Expo.Constants.statusBarHeight : 0
  },
});
