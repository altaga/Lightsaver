import {ethers} from 'ethers';
import React, {Component} from 'react';
import {
  Dimensions,
  Image,
  View,
  Text,
  ScrollView,
  Pressable,
} from 'react-native';
import {abiSaverNFT} from '../../../contracts/saverNFT';
import {EVM, NFTaddress} from '../../../utils/constants';
import {
  getAsyncStorageValue,
  ipfsToHttp,
  setAsyncStorageValue,
} from '../../../utils/utils';
import GlobalStyles, {footer, header} from '../../../styles/styles';

export default class Tab3 extends Component {
  constructor(props) {
    super(props);
    this.state = {
      publicKey: '0x0000000000000000000000000000000000000000',
      loading: true,
      jediNFTs: [],
      open: false,
      nftSelected: 0,
    };
    this.provider = new ethers.providers.JsonRpcProvider(EVM.rpc);
  }
  async componentDidMount() {
    const publicKey = await getAsyncStorageValue('publicKey');
    const memoryNFTs = await getAsyncStorageValue('jediNFTs');
    const memoryFlag = memoryNFTs ?? [];
    await this.setStateAsync({
      publicKey,
      jediNFTs: memoryNFTs ?? [],
      loading: memoryFlag.length === 0 ? true : false,
    });
    const contract = new ethers.Contract(
      NFTaddress,
      abiSaverNFT,
      this.provider,
    );
    const jediData = await contract.forceHistory(publicKey);
    let jediNFTs = jediData[2].map(item => item.toNumber());
    const numbers = jediNFTs;
    jediNFTs = await Promise.all(jediNFTs.map(item => contract.tokenURI(item)));
    jediNFTs = await Promise.all(jediNFTs.map(item => fetch(ipfsToHttp(item))));
    jediNFTs = await Promise.all(jediNFTs.map(item => item.json()));
    jediNFTs = jediNFTs.map((item, index) => {
      return {
        number: numbers[index],
        ...item,
        image: ipfsToHttp(item.image),
      };
    });
    await setAsyncStorageValue({jediNFTs});
    await this.setStateAsync({jediNFTs, publicKey, loading: false});
  }

  // Utils
  async setStateAsync(value) {
    return new Promise(resolve => {
      this.setState(
        {
          ...value,
        },
        () => resolve(),
      );
    });
  }

  render() {
    return (
      <View
        style={{
          width: Dimensions.get('window').width,
        }}>
        <ScrollView
          style={{height: '100%'}}
          contentContainerStyle={{
            flexDirection: 'row',
            justifyContent: 'space-evenly',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
          }}>
          {this.state.loading && (
            <Text
              style={[
                GlobalStyles.title,
                {
                  marginTop:
                    Dimensions.get('screen').height * 0.5 - header - footer,
                },
              ]}>
              Loading...
            </Text>
          )}
          {!this.state.loading && this.state.jediNFTs.length === 0 && (
            <Text
              style={[
                GlobalStyles.title,
                {
                  marginTop:
                    Dimensions.get('screen').height * 0.5 - header - footer,
                },
              ]}>
              No NFTs
            </Text>
          )}
          {this.state.open ? (
            <React.Fragment>
              <View
                style={{
                  width: '80%',
                  height: '100%',
                  overflow: 'hidden',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Pressable
                  style={{
                    width: '100%',
                    height: Dimensions.get('window').width * 0.8,
                    margin: Dimensions.get('window').width * 0.1,
                  }}
                  onPress={() => this.setState({open: false})}>
                  <Image
                    source={{
                      uri: this.state.jediNFTs[this.state.nftSelected].image,
                    }}
                    style={{
                      borderRadius: 10,
                      width: '100%',
                      height: '100%',
                    }}
                  />
                  <View
                    style={{
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      padding: 10,
                    }}>
                    <Text style={{color: 'white', fontSize: 24}}>
                      # {this.state.jediNFTs[this.state.nftSelected].number}
                    </Text>
                  </View>
                </Pressable>
                <Text style={[GlobalStyles.title, {alignSelf: 'flex-start'}]}>
                  Name:
                </Text>
                <Text
                  style={[
                    GlobalStyles.description,
                    {
                      alignSelf: 'flex-start',
                      marginBottom: 10,
                      fontSize: 24,
                    },
                  ]}>
                  {this.state.jediNFTs[this.state.nftSelected].name}
                </Text>
                <Text
                  style={[
                    GlobalStyles.title,
                    {alignSelf: 'flex-start', fontSize: 24},
                  ]}>
                  Description:
                </Text>
                <Text
                  style={[
                    GlobalStyles.description,
                    {alignSelf: 'flex-start', textAlign: 'justify'},
                  ]}>
                  {this.state.jediNFTs[this.state.nftSelected].description}
                </Text>
              </View>
            </React.Fragment>
          ) : (
            <React.Fragment>
              {this.state.jediNFTs.map((item, index) => {
                if (this.state.jediNFTs.length % 2 === 0) {
                  return (
                    <View
                      key={index}
                      style={{
                        width: Dimensions.get('window').width * 0.45,
                        height: Dimensions.get('window').width * 0.45,
                        margin: Dimensions.get('window').width * 0.025,
                        borderRadius: 10,
                        overflow: 'hidden',
                      }}>
                      <Pressable
                        onPress={() =>
                          this.setState({open: true, nftSelected: index})
                        }>
                        <Image
                          source={{uri: item.image}}
                          style={{width: '100%', height: '100%'}}
                        />
                      </Pressable>
                      <View
                        style={{
                          position: 'absolute',
                          bottom: 0,
                          padding: 10,
                        }}>
                        <Text style={{color: 'white'}}>{item.name}</Text>
                      </View>
                      <View
                        style={{
                          position: 'absolute',

                          top: 0,
                          right: 0,
                          padding: 10,
                        }}>
                        <Text style={{color: 'white'}}># {item.number}</Text>
                      </View>
                    </View>
                  );
                } else {
                  if (index === this.state.jediNFTs.length - 1) {
                    return (
                      <React.Fragment key={index}>
                        <View
                          key={index}
                          style={{
                            width: Dimensions.get('window').width * 0.45,
                            height: Dimensions.get('window').width * 0.45,
                            margin: Dimensions.get('window').width * 0.025,
                            borderRadius: 10,
                            overflow: 'hidden',
                          }}>
                          <Pressable
                            onPress={() =>
                              this.setState({open: true, nftSelected: index})
                            }>
                            <Image
                              source={{uri: item.image}}
                              style={{width: '100%', height: '100%'}}
                            />
                          </Pressable>
                          <View
                            style={{
                              position: 'absolute',
                              bottom: 0,
                              padding: 10,
                            }}>
                            <Text style={{color: 'white'}}>{item.name}</Text>
                          </View>
                          <View
                            style={{
                              position: 'absolute',

                              top: 0,
                              right: 0,
                              padding: 10,
                            }}>
                            <Text style={{color: 'white'}}>
                              # {item.number}
                            </Text>
                          </View>
                        </View>
                        <View
                          style={{
                            width: Dimensions.get('window').width * 0.45,
                            height: Dimensions.get('window').width * 0.45,
                            margin: Dimensions.get('window').width * 0.025,
                          }}
                        />
                      </React.Fragment>
                    );
                  } else {
                    return (
                      <View
                        key={index}
                        style={{
                          width: Dimensions.get('window').width * 0.45,
                          height: Dimensions.get('window').width * 0.45,
                          margin: Dimensions.get('window').width * 0.025,
                          borderRadius: 10,
                          overflow: 'hidden',
                        }}>
                        <Pressable
                          onPress={() =>
                            this.setState({open: true, nftSelected: index})
                          }>
                          <Image
                            source={{uri: item.image}}
                            style={{width: '100%', height: '100%'}}
                          />
                        </Pressable>
                        <View
                          style={{
                            position: 'absolute',
                            bottom: 0,
                            padding: 10,
                          }}>
                          <Text style={{color: 'white'}}>{item.name}</Text>
                        </View>
                        <View
                          style={{
                            position: 'absolute',

                            top: 0,
                            right: 0,
                            padding: 10,
                          }}>
                          <Text style={{color: 'white'}}># {item.number}</Text>
                        </View>
                      </View>
                    );
                  }
                }
              })}
            </React.Fragment>
          )}
        </ScrollView>
      </View>
    );
  }
}
