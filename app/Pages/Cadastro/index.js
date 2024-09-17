import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, Switch, StyleSheet, Alert, Platform, ScrollView, Button } from 'react-native';
import { AuthContext } from '../Autenticacao'; 
import { setDoc, doc } from 'firebase/firestore';
import { auth, db } from '../../FireBase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';
import * as ImagePicker from 'expo-image-picker';

export default function Cadastro() {
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [cpf, setCpf] = useState('');
    const [rg, setRg] = useState('');
    const [cidade, setCidade] = useState('');
    const [estado, setEstado] = useState('');
    const [telefone, setTelefone] = useState('');
    const [isTrue, setIsTrue] = useState(false);
    const [crasNumber, setCrasNumber] = useState('');
    const [image, setImage] = useState(null);

    const { cadastrarUser } = useContext(AuthContext);

    const toggleSwitch = () => setIsTrue(prevState => !prevState);

    const handleCadastro = async () => {
       
    
        if (!nome || !email || !senha || !cpf || !rg || !cidade || !estado || !telefone || !crasNumber || !image ) {
            Alert.alert("Erro", "Por favor, preencha todos os campos obrigatórios.");
            return;
        }
    
        if (isTrue && !crasNumber) {
            Alert.alert("Erro", "Por favor, informe o número do cadastro no CRAS.");
            return;
        }

        try {
            const user = await cadastrarUser(email, senha);
            if (user.error) {
                Alert.alert('Erro', user.error);
            } else {
                Alert.alert('Sucesso', 'Cadastro realizado com sucesso!');

                const deviceInfo = {
                    deviceName: Device.deviceName || 'Desconhecido',
                    deviceBrand: Device.brand,
                    deviceOS: Platform.OS,
                };

                const userDoc = doc(db, 'usuarios', email.toLowerCase());

                await setDoc(userDoc, {
                    Nome: nome,
                    Email: email.toLowerCase(),
                    CPF: cpf,
                    RG: rg,
                    Cidade: cidade,
                    Estado: estado,
                    Telefone: telefone,
                    BeneficioCras: isTrue,
                    DeviceInfo: deviceInfo,
                    CrasNumber: crasNumber,
                    DataCriado: new Date(),
                    Beneficios: null,
                    FotoPerfil: image

                });

                await AsyncStorage.setItem('@userEmail', email.toLowerCase());
                console.log("Email salvo com sucesso:", await AsyncStorage.getItem('@userEmail'));
            }
        } catch (error) {
            Alert.alert('Erro', 'Ocorreu um erro ao tentar se cadastrar.');
            console.error(error);
        }
    };

    const pickImage = async () => {

        let result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.All,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 1,
        });
    
        console.log(result);
        
    
        if (!result.canceled) {
          setImage(result.assets[0].uri);
        }
      };
      
    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.header}>Página de Cadastro</Text>

            <View style={styles.formContainer}>
                <Text>Preencha seus dados</Text>

                <Text>Nome:</Text>
                <TextInput
                    style={styles.input}
                    placeholder='Ex: Luiz Costa Silva'
                    value={nome}
                    onChangeText={setNome}
                />

                <Text>Email:</Text>
                <TextInput
                    style={styles.input}
                    placeholder='Digite seu email'
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                />

                <Text>Senha:</Text>
                <TextInput
                    style={styles.input}
                    secureTextEntry={true}
                    placeholder='Digite sua senha'
                    value={senha}
                    onChangeText={setSenha}
                />

                <Text>CPF:</Text>
                <TextInput
                    style={styles.input}
                    placeholder='Ex: xxx.xxx.xxx-xx'
                    value={cpf}
                    onChangeText={setCpf}
                    keyboardType="numeric"
                />

                <Text>RG:</Text>
                <TextInput
                    style={styles.input}
                    placeholder='Ex: xxxxxxxxx'
                    value={rg}
                    onChangeText={setRg}
                    keyboardType="numeric"
                />

                <Text>Cidade:</Text>
                <TextInput
                    style={styles.input}
                    placeholder='Ex: São Paulo'
                    value={cidade}
                    onChangeText={setCidade}
                />

                <Text>Estado:</Text>
                <TextInput
                    style={styles.input}
                    placeholder='Ex: SP'
                    value={estado}
                    onChangeText={setEstado}
                />

                <Text>Telefone:</Text>
                <TextInput
                    style={styles.input}
                    placeholder='Ex: (00) 0 0000-0000'
                    value={telefone}
                    onChangeText={setTelefone}
                    keyboardType="numeric"
                />

                <View style={styles.switchContainer}>
                    <Text>Possui benefícios do governo?</Text>
                    <Switch value={isTrue} onValueChange={toggleSwitch} />
                </View>

                {isTrue && (
                    <TextInput
                        style={styles.input}
                        placeholder='Número do cadastro no Cras'
                        value={crasNumber}
                        onChangeText={setCrasNumber}
                        keyboardType="numeric"
                    />
                )}

                

                <TouchableOpacity style={styles.buttonPerfil} onPress={pickImage}>
                    <Text style={styles.buttonText}>Foto de perfil</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={handleCadastro}>
                    <Text style={styles.buttonText}>Cadastrar</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 16,
        backgroundColor: '#f9f9f9',
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    formContainer: {
        marginTop: 16,
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 4,
        paddingLeft: 8,
        marginBottom: 10,
        backgroundColor: '#fff',
    },
    switchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    button: {
        backgroundColor: '#007BFF',
        padding: 12,
        borderRadius: 4,
        alignItems: 'center',
        marginBottom: 20
        
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    buttonPerfil: {
        backgroundColor: 'green',
        padding: 12,
        borderRadius: 4,
        alignItems: 'center',
        marginBottom: 20
        
    }
});
