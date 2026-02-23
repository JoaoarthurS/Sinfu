import React from 'react';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import AntDesign from 'react-native-vector-icons/AntDesign';

export type IconFamily = 'FontAwesome' | 'MaterialIcons' | 'Ionicons' | 'Feather' | 'AntDesign';

interface IconProps {
  family?: IconFamily;
  name: string;
  size?: number;
  color?: string;
  style?: any;
}

/**
 * Componente de ícone unificado que suporta múltiplas bibliotecas
 * 
 * @example
 * <Icon family="Ionicons" name="notifications-outline" size={24} color="#4F8EF7" />
 * <Icon family="FontAwesome" name="bell" size={20} color="#FF6B6B" />
 * <Icon family="MaterialIcons" name="notifications" size={28} />
 */
export const Icon: React.FC<IconProps> = ({
  family = 'Ionicons',
  name,
  size = 24,
  color = '#000',
  style,
}) => {
  const iconProps = { name, size, color, style };

  switch (family) {
    case 'FontAwesome':
      return <FontAwesome {...iconProps} />;
    case 'MaterialIcons':
      return <MaterialIcons {...iconProps} />;
    case 'Feather':
      return <Feather {...iconProps} />;
    case 'AntDesign':
      return <AntDesign {...iconProps} />;
    case 'Ionicons':
    default:
      return <Ionicons {...iconProps} />;
  }
};

export default Icon;
