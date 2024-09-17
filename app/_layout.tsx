
import { NavigationContainer } from "@react-navigation/native";


import Home from './Pages/Home';

import Rotas from './Rotas'
export default function RootLayout() {
  return (
    <NavigationContainer independent={true}>
      <Rotas/>    

    </NavigationContainer>
  );
}

