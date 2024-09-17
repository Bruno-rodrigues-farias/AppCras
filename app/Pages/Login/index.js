import React, { useContext, useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, Alert, Image } from 'react-native';
import { AuthContext } from '../Autenticacao';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Logo from '../../../assets/imagens/logo.png'
export default function Login({ navigation }) {
    const { logarUser } = useContext(AuthContext);
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [loading, setLoading] = useState(false);

    async function fazerLogin() {
        if (loading) {
            console.log("Tentativa de login ignorada devido ao carregamento"); // Debug
            return;
        }

        console.log("Iniciando o login"); // Debug
        setLoading(true);

        try {
            await logarUser(email, senha);
            await AsyncStorage.setItem('@userEmail', email.toLowerCase());
            console.log("Email salvo com sucesso:", await AsyncStorage.getItem('@userEmail'));
            
        } catch (error) {
            console.log("Erro ao logar:", error);
            Alert.alert("Erro", "Não foi possível fazer login. Verifique suas credenciais.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <View style={styles.container}>
            
            <Text style={styles.header}>Página de Login</Text>
            <View style={styles.logoContainer}>
                <Image source={require('../../../assets/imagens/logo.png')} style={styles.logo}/>
                </View>
            <View style={styles.formContainer}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Digite seu email"
                    keyboardType="email-address"
                    value={email}
                    onChangeText={(text) => setEmail(text)}
                />

                <Text style={styles.label}>Senha</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Digite sua senha"
                    secureTextEntry={true}
                    value={senha}
                    onChangeText={(text) => setSenha(text)}
                />

                <TouchableOpacity
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={fazerLogin}
                    disabled={loading} // Desativa o botão se estiver carregando
                >
                    <Text style={styles.buttonText}>{loading ? 'Entrando...' : 'Entrar'}</Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={() => navigation.navigate('Cadastro')}>
                <Text style={styles.link}>Não possui uma conta? Cadastre-se</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        justifyContent: 'center',
        backgroundColor: '#F5F5F5',
    },
    header: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 32,
        textAlign: 'center',
        color: '#333',
    },
    formContainer: {
        marginBottom: 20,
        paddingHorizontal: 16,
        borderRadius: 8,
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        paddingTop: 20,
        paddingBottom: 20
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
        color: '#333',
    },
    input: {
        height: 40,
        borderColor: '#CCC',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
        marginBottom: 16,
        backgroundColor: '#FAFAFA',
    },
    button: {
        backgroundColor: '#007BFF',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonDisabled: {
        backgroundColor: '#5A9BF1', // Cor mais clara para o botão desativado
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    link: {
        color: '#007BFF',
        fontSize: 16,
        textAlign: 'center',
        marginTop: 16,
    },
    logo:{
        width: 200,
        height:300,
        borderRadius: 50
    },
    logoContainer:{
        alignItems:'center'
    }
});
