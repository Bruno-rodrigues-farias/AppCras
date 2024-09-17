import React, { useEffect, useState, useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ActivityIndicator, Modal, ScrollView, Linking } from 'react-native';
import { doc, onSnapshot } from 'firebase/firestore';
import { AuthContext } from '../Autenticacao';
import { auth, db } from '../../FireBase';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Home() {
    const [userDoc, setUserDoc] = useState(null);
    const [loading, setLoading] = useState(true);
    const { deslogarUser } = useContext(AuthContext);
    const [modalVisible, setModalVisible] = useState(false);
    
    // Função para recuperar o email e os dados do usuário
    const recuperarEmail = async () => {
        try {
            const emailSalvo = await AsyncStorage.getItem('@userEmail');
            if (emailSalvo) {
                const docRef = doc(db, 'usuarios', emailSalvo.toLowerCase());

                const unsubscribe = onSnapshot(docRef, (docSnap) => {
                    if (docSnap.exists()) {
                        setUserDoc(docSnap.data());
                        
                    } else {
                        console.log('Documento não encontrado!');
                        setUserDoc(null);
                    }
                    setLoading(false);
                });

                return () => unsubscribe();
            } else {
                console.log("Nenhum email salvo");
                setUserDoc(null);
                setLoading(false);
            }
        } catch (erro) {
            console.log('Erro na recuperação do email:', erro);
            setLoading(false);
        }
    };

    useEffect(() => {
        recuperarEmail();
    }, []);

    // Função para atualizar os dados
    const atualizarDados = () => {
        setLoading(true);
        recuperarEmail();
    };

    function sairDaConta() {
        deslogarUser(auth);
    }

    // Função para abrir o WhatsApp
    const abrirWhatsApp = () => {
        const telefone = '+5511999999999'; // Substitua pelo número do telefone desejado
        const mensagem = 'Olá, preciso de ajuda com um problema.';
        const url = `whatsapp://send?phone=${telefone}&text=${encodeURIComponent(mensagem)}`;

        Linking.canOpenURL(url)
            .then((supported) => {
                if (supported) {
                    return Linking.openURL(url);
                } else {
                    alert('WhatsApp não está instalado');
                }
            })
            .catch((err) => console.error('Erro ao abrir o WhatsApp', err));
    };

    return (
        <ScrollView style={styles.container}>
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size='large' color='#007bff' />
                    <Text style={styles.loadingText}>Carregando...</Text>
                </View>
            ) : userDoc ? (
                <View style={styles.profileContainer}>
                    <Image
                        source={{ uri: userDoc.FotoPerfil || 'https://via.placeholder.com/100' }}
                        style={styles.profileImage}
                    />
                    
                    <Text style={styles.name}>{userDoc.Nome}</Text>
                    
                    {userDoc.Cidade && <Text style={styles.info}>Cidade: {userDoc.Cidade}</Text>}
                    {userDoc.Estado && <Text style={styles.info}>Estado: {userDoc.Estado}</Text>}
                    {userDoc.CPF && <Text style={styles.info}>CPF: {userDoc.CPF}</Text>}
                    {userDoc.RG && <Text style={styles.info}>RG: {userDoc.RG}</Text>}
                    {userDoc.Beneficios ? (
                        Array.isArray(userDoc.Beneficios) && userDoc.Beneficios.length > 0 ? (
                            <Text style={styles.info}>
                                Benefícios disponíveis: {userDoc.Beneficios.join(', ')}
                            </Text>
                        ) : (
                            <Text style={styles.info}>Nenhum benefício disponível</Text>
                        )
                    ) : (
                        <>
                            <Text>Nenhum benefício por enquanto</Text>
                            <ActivityIndicator size='small' color='#007bff'/>
                        </>
                    )}

                    <TouchableOpacity style={styles.openButton} onPress={() => setModalVisible(true)}>
                        <Text style={styles.buttonText}>Sobre o benefício</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <Text style={styles.noDataText}>Nenhum dado disponível! Clique em atualizar</Text>
            )}

            {/* Botão de atualizar */}
            <TouchableOpacity style={styles.updateButton} onPress={atualizarDados}>
                <Text style={styles.buttonText}>Atualizar</Text>
            </TouchableOpacity>

            {/* Botão do WhatsApp */}
            <TouchableOpacity style={styles.whatsappButton} onPress={abrirWhatsApp}>
                <Text style={styles.buttonText}>Falar no WhatsApp</Text>
            </TouchableOpacity>

            {/* Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalText}>O programa "Vida Plena" é um benefício inovador criado...</Text>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setModalVisible(false)}
                        >
                            <Text style={styles.buttonText}>Fechar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <TouchableOpacity style={styles.logoutButton} onPress={sairDaConta}>
                <Text style={styles.logoutText}>Sair da conta</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    profileContainer: {
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#ffffff',
        borderRadius: 10,
        margin: 15,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        marginBottom: 20,
        borderWidth: 3,
        borderColor: '#007bff',
    },
    name: {
        fontSize: 30,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
    },
    info: {
        fontSize: 14,
        color: '#555',
        marginBottom: 5,
        fontWeight: 'bold'
    },
    openButton: {
        backgroundColor: '#28a745',
        paddingVertical: 8,
        paddingHorizontal: 12, // Menor padding horizontal
        borderRadius: 5,
        marginTop: 20,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 2,
        width: 200, // Largura fixa
        alignItems: 'center',
        alignSelf: 'center', // Alinha o botão ao centro
    },
    updateButton: {
        backgroundColor: '#007bff',
        paddingVertical: 8,
        paddingHorizontal: 12, // Menor padding horizontal
        borderRadius: 5,
        margin: 20,
        alignItems: 'center',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 2,
        width: 200, // Largura fixa
        alignSelf: 'center', // Alinha o botão ao centro
    },
    noDataText: {
        textAlign: 'center',
        fontSize: 16,
        color: '#777',
        marginTop: 20,
    },
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 5,
    },
    modalText: {
        marginBottom: 15,
        textAlign: 'center',
        fontSize: 16,
        color: '#333',
    },
    closeButton: {
        backgroundColor: '#dc3545',
        paddingVertical: 8,
        paddingHorizontal: 12, // Menor padding horizontal
        borderRadius: 5,
        width: 100, // Largura fixa
        alignItems: 'center',
        alignSelf: 'center', // Alinha o botão ao centro
    },
    logoutButton: {
        backgroundColor: '#dc3545',
        paddingVertical: 8,
        paddingHorizontal: 12, // Menor padding horizontal
        borderRadius: 5,
        margin: 20,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 2,
        width: 200, // Largura fixa
        alignItems: 'center',
        alignSelf: 'center', // Alinha o botão ao centro
    },
    logoutText: {
        color: '#fff',
        fontSize: 14,
        textAlign: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 14,
        textAlign: 'center',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 20,
        color: '#007bff',
        marginTop: 10,
    },
    whatsappButton: {
        backgroundColor: '#25D366',
        paddingVertical: 8,
        paddingHorizontal: 12, // Menor padding horizontal
        borderRadius: 5,
        margin: 20,
        alignItems: 'center',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 2,
        width: 200, // Largura fixa
        alignSelf: 'center', // Alinha o botão ao centro
    },
});

