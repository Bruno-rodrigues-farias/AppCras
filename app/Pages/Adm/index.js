import { View, Text, TouchableOpacity, FlatList, StyleSheet, TextInput, Button, Modal, Image } from 'react-native';
import { useContext, useState, useEffect } from 'react';
import { auth, db } from '../../FireBase';
import { collection, updateDoc, deleteDoc, doc, getDoc, onSnapshot } from 'firebase/firestore';
import { AuthContext } from '../Autenticacao';

// Funções para formatar CPF e RG
const formatCPF = (cpf) => {
    return cpf.replace(/\D/g, '') 
              .replace(/(\d{3})(\d)/, '$1.$2')
              .replace(/(\d{3})(\d)/, '$1.$2')
              .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
};

const formatRG = (rg) => {
    return rg.replace(/\D/g, '') 
             .replace(/(\d{2})(\d)/, '$1.$2')
             .replace(/(\d{3})(\d)/, '$1.$2')
             .replace(/(\d{3})(\d)$/, '$1-$2');
};

const formatTimestamp = (timestamp) => {
    if (timestamp && timestamp.seconds) {
        const date = new Date(timestamp.seconds * 1000);
        return date.toLocaleDateString('pt-BR'); 
    }
    return '';
};

export default function Adm() {
    const { deslogarUser, fotoPerfil } = useContext(AuthContext);
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [newBenefit, setNewBenefit] = useState('');
    const [modalVisible, setModalVisible] = useState(false);

    useEffect(() => {
        const docRef = collection(db, 'usuarios');

        // Usar onSnapshot para escutar mudanças em tempo real
        const unsubscribe = onSnapshot(docRef, (querySnapshot) => {
            const docs = querySnapshot.docs.map(doc => {
                const data = doc.data();
                console.log('Document data:', data); 
                return { id: doc.id, ...data };
            });
            setUsers(docs);
        }, (error) => {
            console.error("Erro ao buscar documentos:", error);
        });

        // Limpar o listener quando o componente for desmontado
        return () => unsubscribe();
    }, []);

    const handleUpdateUser = async (userId, updatedData) => {
        const userDocRef = doc(db, 'usuarios', userId);
        try {
            await updateDoc(userDocRef, updatedData);
        } catch (error) {
            console.error("Erro ao atualizar documento:", error);
        }
    };

    const handleDeleteUser = async (userId) => {
        const userDocRef = doc(db, 'usuarios', userId);
        try {
            await deleteDoc(userDocRef);
        } catch (error) {
            console.error("Erro ao deletar documento:", error);
        }
    };

    const addBenefit = () => {
        if (selectedUser && newBenefit) {
            const updatedBenefits = Array.isArray(selectedUser.Beneficios) ? [...selectedUser.Beneficios, newBenefit] : [newBenefit];
            handleUpdateUser(selectedUser.id, { Beneficios: updatedBenefits });
            setNewBenefit('');
            setModalVisible(false);
        }
    };

    const removeBenefit = async (userId, benefitToRemove) => {
        const userDocRef = doc(db, 'usuarios', userId);
    
        try {
            // Encontrar o documento do usuário
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
                const currentBenefits = userDoc.data().Beneficios || [];
    
                // Filtrar o benefício específico a ser removido
                const updatedBenefits = currentBenefits.filter(benefit => benefit !== benefitToRemove);
    
                // Atualizar o documento no Firestore
                await updateDoc(userDocRef, { Beneficios: updatedBenefits });
    
                // Atualizar o estado local (opcional)
                setUsers(users.map(user => (user.id === userId ? { ...user, Beneficios: updatedBenefits } : user)));
            }
        } catch (error) {
            console.error("Erro ao remover benefício:", error);
        }
    };

    function sairDaConta() {
        deslogarUser(auth);
    }
    

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Página do Administrador</Text>
            <TouchableOpacity style={styles.logoutButton} onPress={sairDaConta}>
                <Text style={styles.logoutText}>Sair da conta</Text>
            </TouchableOpacity>
            <FlatList
                data={users}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.userCard}>
                    
                        <Text style={styles.userName}>Nome: {item.Nome}</Text>
                        <Text style={styles.userEmail}>Email: {item.Email}</Text>
                        <Text style={styles.userEmail}>Cidade: {item.Cidade}</Text>
                        <Text style={styles.userEmail}>Estado: {item.Estado}</Text>
                        <Text style={styles.userEmail}>Cpf: {formatCPF(item.CPF)}</Text>
                        <Text style={styles.userEmail}>Rg: {formatRG(item.RG)}</Text>
                        <Text style={styles.userEmail}>Tel: {item.Telefone}</Text>
                        <Text style={styles.userEmail}>N° Cras: {item.CrasNumber}</Text>
                        <Text style={styles.userEmail}>Benefícios disponíveis:</Text>
                        {Array.isArray(item.Beneficios) && item.Beneficios.length > 0 ? (
                            item.Beneficios.map((benefit, index) => (
                                <View key={index} style={styles.benefitContainer}>
                                    <Text style={styles.userEmail}>{benefit}</Text>
                                    <TouchableOpacity
                                        style={styles.deleteButton}
                                        onPress={() => removeBenefit(item.id, benefit)}>
                                        <Text style={styles.buttonText}>Remover Benefício</Text>
                                    </TouchableOpacity>
                                </View>
                            ))
                        ) : (
                            <Text style={styles.userEmail}>Nenhum benefício disponível</Text>
                        )}
                        <Text style={styles.userEmail}>Data da conta: {formatTimestamp(item.DataCriado)}</Text>
                        {item.DeviceInfo && (
                            <Text style={styles.userEmail}>
                                Dispositivo: {item.DeviceInfo.deviceBrand || 'Desconhecido'} / 
                                {item.DeviceInfo.deviceName || 'Desconhecido'} / 
                                {item.DeviceInfo.deviceOS || 'Desconhecido'}
                            </Text>
                        )}
                        <TouchableOpacity
                            style={styles.updateButton}
                            onPress={() => {
                                setSelectedUser(item);
                                setModalVisible(true);
                            }}
                        >
                            <Text style={styles.buttonText}>Atualizar Benefícios</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.deleteButton}
                            onPress={() => handleDeleteUser(item.id)}
                        >
                            <Text style={styles.buttonText}>Deletar</Text>
                        </TouchableOpacity>
                    </View>
                )}
            />
            <Modal
                transparent={true}
                animationType="slide"
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Adicionar Benefício</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Novo benefício"
                            value={newBenefit}
                            onChangeText={setNewBenefit}
                        />
                        <Button title="Adicionar" onPress={addBenefit} />
                        <Button title="Cancelar" onPress={() => setModalVisible(false)} />
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#F5F5F5',
    },
    header: {
        textAlign: 'center',
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
        marginTop: 20
    },
    logoutButton: {
        backgroundColor: '#FF4C4C',
        padding: 10,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 16,
    },
    logoutText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    userCard: {
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 8,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        gap:8
    },
    userName: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    userEmail: {
        fontSize: 16,
        color: '#666',
        marginBottom: 8,
    },
    updateButton: {
        backgroundColor: '#007BFF',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        marginBottom: 8,
    },
    deleteButton: {
        backgroundColor: '#FF4C4C',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        marginBottom: 8,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        padding: 20,
        borderRadius: 10,
        width: '80%',
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    input: {
        borderBottomWidth: 1,
        borderColor: '#ccc',
        width: '100%',
        marginBottom: 10,
    },
    benefitContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    foto:{
        width: 300,
        height: 200
    }
   
});
