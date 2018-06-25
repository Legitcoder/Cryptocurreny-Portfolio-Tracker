import React, { Component } from 'react'
import { connect } from 'react-redux';
import {Text, TextInput, View, ScrollView, StyleSheet, TouchableWithoutFeedback, ActivityIndicator } from 'react-native';
import { Divider } from 'react-native-elements'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import DateTimePicker  from 'react-native-modal-datetime-picker';
import { MaterialIcons } from '@expo/vector-icons';
import { getTradingPairsPriceHash, getCoinUSDPrice, getCoinBTCPrice } from '../actions';
import TransactionButton from '../common/TransactionButton';

//React Native's Stack Navigator doesn't allow state to be reseted 
//so if user searches for another coin the previous coins
// autofilled credentials will appear. Come back and fix or 
// worst case scenario, no default active exchange or trading pair is selected
//Possible solution: pass refresh function through navgiation params


//This component needs major refactoring. Will come back after MVP is deployed.
//Temporarily disbaled price autofill feature to implement update feature
class TransactionForm extends Component {
    constructor(props){
        super(props);
        const { transaction } = this.props.navigation.state.params; 
        this.initialState = {
            exchanges: [],
            tradingPairs: [],
            activeExchange: '', 
            activeTradingPair: '', 
            isDateTimePickerVisible: false,
            date: new Date().toString().slice(0 , -18),
            tradingPairsPrices: '',
            amount: "",
            priceBought: 0,
            usdPrice: null                
        }
        if(transaction) this.initialState = { ...transaction, activeExchange: transaction.exchange, activeTradingPair: transaction.tradingPair, priceBought: transaction.priceBought.toString()};
        this.state = this.initialState;
    }

    componentDidMount() {
        let { getCoinUSDPrice, coin } = this.props;
        if(!coin) coin = this.props.navigation.state.params.coin;
        getCoinUSDPrice(coin.Symbol);
        getCoinBTCPrice(coin.Symbol);
    }

    extractExchangeIndex(exchangeObjArray, activeExchange) {
        if(!exchangeObjArray) return 0;
        return exchangeObjArray.map(exchangeObj => exchangeObj.exchange).indexOf(activeExchange);
    }

    componentWillReceiveProps(nextProps) {
        const {getTradingPairsPriceHash, tradingPairsPrices, exchanges, usdPrice, btcPrice } = nextProps;
        let { coin } = nextProps;
        let newState;
        const { transaction } = this.props.navigation.state.params
        if(!coin) coin = this.props.navigation.state.params.coin;
        let activeExchangeIndex = this.extractExchangeIndex(exchanges, this.state.activeExchange);
        if(activeExchangeIndex === -1) activeExchangeIndex = 0;
        if(exchanges) {
             newState = {
                exchanges: exchanges,
                tradingPairs: this.state.activeExchange ? exchanges[activeExchangeIndex].pairs : [] ,
                tradingPairsPrices: tradingPairsPrices,
                usdPriceTransacted: usdPrice ? usdPrice["USD"] : null,
                btcPriceTransacted: btcPrice ? btcPrice["BTC"] : null,
                currentUSDPrice: usdPrice ? usdPrice["USD"] : null,
                currentBTCPrice: btcPrice ? btcPrice["BTC"] : null,
            }
                this.setState(newState, () => {
                    if(!tradingPairsPrices) {
                        getTradingPairsPriceHash(coin.Symbol, this.state.tradingPairs, this.state.activeExchange);
                    }
                });
                if(!transaction) newState = { ...newState, priceBought: tradingPairsPrices ? this.state.activeTradingPair !== '' ? tradingPairsPrices[this.state.activeTradingPair].toString() : "" : "", activeExchange: exchanges.length === 0 ? "N/A" : this.state.activeExchange === '' ? exchanges[0].exchange : this.state.activeExchange, 
                activeTradingPair: exchanges.length === 0 ? "N/A" : this.state.activeTradingPair === '' ? exchanges[0].pairs[0] : this.state.activeTradingPair,}
        }
    }

    _showDateTimePicker = () => this.setState({ isDateTimePickerVisible: true });

    _hideDateTimePicker = () => this.setState({ isDateTimePickerVisible: false });

    _handleDatePicked = (date) => {
        this.setState({date: date.toString().slice(0 , -18)})
        this._hideDateTimePicker();
    };

    onPressExchanges = (item) => {
        let { coin } = this.props;
        if(!coin) coin = this.props.navigation.state.params.coin;
        console.log(coin);
        const { exchange, pairs } = item;
        console.log(item);
        const { getTradingPairsPriceHash } = this.props;
        this.props.getTradingPairsPriceHash(coin.Symbol, pairs, exchange);
        this.setState((prevState, props) => {return { activeExchange: exchange, activeTradingPair: pairs[0], tradingPairs: pairs}});
    }

    onPressTradingPairs = (selectedTradingPair) => {
        this.setState({ activeTradingPair: selectedTradingPair});
    }

    refresh = () => {
        this.setState(this.initialState);
    }

    renderForm = () => {
        let { coin } = this.props;
        if(!coin) coin = this.props.navigation.state.params.coin;
        return(
            <View style={styles.formContainer}>
                <TouchableWithoutFeedback 
                onPress={ () => this.props.navigation.navigate('exchanges', { exchanges: this.state.exchanges, onPressExchanges: this.onPressExchanges})} >
                    <View style={[styles.formItemContainer]}>
                        <Text style={styles.labelTextStyle}>Exchange</Text>  
                        <Text style={styles.selectionTextStyles}>{this.state.activeExchange}</Text>
                        <MaterialIcons style={styles.navigateNextIconStyle} name="navigate-next" size={40} />
                    </View>
                </TouchableWithoutFeedback>
                <Divider style={{ backgroundColor: '#000' }} />
                <TouchableWithoutFeedback 
                onPress={ () => this.props.navigation.navigate('tradingPairs', {tradingPairs: this.state.tradingPairs, onPressTradingPairs: this.onPressTradingPairs})} >
                    <View style={styles.formItemContainer}>                                      
                        <Text style={styles.labelTextStyle}>Trading Pair</Text>
                        <Text style={styles.selectionTextStyles}>{this.state.activeTradingPair === '' ? '' : `${coin.CoinName}/${this.state.activeTradingPair}`}</Text>
                        <MaterialIcons style={styles.navigateNextIconStyle} name="navigate-next" size={40} />
                    </View>
                </TouchableWithoutFeedback>
                <Divider style={{ backgroundColor: '#000' }} />
                <View style={styles.formItemContainer}>                     
                    <Text style={styles.selectionTextStyles}>{this.props.activeOrderState} Price in {this.state.activeTradingPair}</Text>
                    <TextInput underlineColorAndroid='transparent' style={[styles.selectionTextStyles, {width: '100%'}]} placeholder="Price" placeholderTextColor="#80808050"  value={this.state.priceBought ? this.state.priceBought : this.state.tradingPairsPrices ? (this.state.tradingPairsPrices[this.state.activeTradingPair]) ? (this.state.tradingPairsPrices[this.state.activeTradingPair]).toString() : "" : ""} onChangeText={ (text) => this.setState({priceBought: text})} />
                </View>  
                <Divider style={{ backgroundColor: '#000' }} />
                <View style={styles.formItemContainer}>                     
                    <TextInput underlineColorAndroid='transparent' style={[styles.selectionTextStyles, {width: '100%'}]} placeholder="Amount Bought"
                    value={this.state.amount ? this.state.amount : ""}  placeholderTextColor="#80808050" onChangeText={(text) => this.setState({amount: text}) } />
                </View> 
                <Divider style={{ backgroundColor: '#000' }} />
                <View style={styles.formItemContainer}>
                    <Text style={styles.labelTextStyle}>Date & Time</Text>                       
                    <Text style={styles.selectionTextStyles} onPress={this._showDateTimePicker}>{this.state.date}</Text>
                </View>
                <DateTimePicker
                    mode="datetime"
                    isVisible={this.state.isDateTimePickerVisible}
                    onConfirm={this._handleDatePicked}
                    onCancel={this._hideDateTimePicker}
                    />              
            </View> 
        );
    }

    render() {
        const { onPress, activeOrderState } = this.props;
        const { transaction } = this.props.navigation.state.params;
        return(
            <View style={{flex: 6}}>
             {this.renderForm()}
             <TransactionButton 
                text={this.props.activeOrderState ? 'Add Transaction' : ''} 
                buttonColor={this.props.activeOrderState  === "Buy" && !transaction ? '#008000' : transaction ? null : '#FF0000'}
                onPress={ () => {onPress({...this.state, activeOrderState: activeOrderState }), this.refresh()} } 
              />    
            </View>
        );
    }
}

const mapStateToProps = (state) => {
    return{
        tradingPairsPrices: state.coins.tradingPairsPrices,
        exchanges: state.coins.exchanges,
        coin: state.coins.coin,
        usdPrice: state.coins.usdPrice,
        btcPrice: state.coins.btcPrice
    }
}

const styles = StyleSheet.create({
    formContainer: {
        flexGrow: 1,
        alignSelf: 'stretch',
        justifyContent: 'space-between',
        alignItems: 'stretch',
        backgroundColor: '#282E33',
        marginBottom: 80,
    },
    navigateNextIconStyle: {
        position: 'absolute',
        right: 0,
        color: "#fff"
    },
    formItemContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'flex-start',
        backgroundColor: '#282E33',
    },
    selectionTextStyles: {
        color: "#fff",
        fontSize: 18,
        margin: 2.5,
        marginLeft: 10
    },
    labelTextStyle: {
        color: "gray",
        fontSize: 14,
        margin: 2.5,
        marginLeft: 10
    }
});

export default connect(mapStateToProps, {getTradingPairsPriceHash, getCoinUSDPrice})(TransactionForm);