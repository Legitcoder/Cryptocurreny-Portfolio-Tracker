import React, { Component } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import TransactionList from './TransactionList';


class Transactions extends Component {
    render() {
        return(
            <View style={styles.container}>
                <TransactionList />
            </View>    
        );
    }
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#282E33',
      justifyContent: 'center',
      alignItems: 'center'
    },
  });

export default Transactions;