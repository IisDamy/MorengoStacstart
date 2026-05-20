import {View, Text, FlatList, TouchableOpacity, Platform} from 'react-native'
import {router, useLocalSearchParams} from "expo-router";
import {useState} from "react";
import { Category } from '@/types';
import { MaterialIcons } from '@expo/vector-icons';


const Filter = ({ categories }: { categories: Category[] }) => {

    const categoriesarray = ['recent', 'local', 'fastfood', 'favourite', 'popular','restaurant','bakery']

    // const searchParams = useLocalSearchParams();
    // const [active, setActive] = useState(searchParams.category || '');

    // const handlePress = (id: string) => {
    //     setActive(id);

    //     if(id === 'all') router.setParams({ category: undefined });
    //     else router.setParams({ category: id });
    // };

    // const filterData: (Category | { $id: string; name: string })[] = categories
    //     ? [{ $id: 'all', name: 'All' }, ...categories]
    //     : [{ $id: 'all', name: 'All' }]

    return (
        // <FlatList
        //     data={filterData}
        //     keyExtractor={(item) => item.$id}
        //     horizontal
        //     showsHorizontalScrollIndicator={false}
        //     contentContainerClassName="gap-x-2 absolute pb-3"
        //     renderItem={({ item }) => (
        //         <TouchableOpacity
        //             key={item.$id}
        //             className={cn('filter', active === item.$id ? 'bg-amber-500' : 'bg-white')}
        //             style={Platform.OS === 'android' ? { elevation: 5, shadowColor: '#878787'} : {}}
        //             onPress={() => handlePress(item.$id)}
        //         >
        //             <Text className={cn('body-medium', active === item.$id ? 'text-white' : 'text-gray-200')}>{item.name}</Text>
        //         </TouchableOpacity>
        //     )}
        // />
        <View>
            <MaterialIcons name="tune" size={24} color="#6498e0" />
            <View className='absolute w-[120] z-10  border bg-white top-[-40] right-0rounded shadow-md shadow-black/10 p-3'>
                {categoriesarray.map((category, index) => (
                    <TouchableOpacity key={index} className='py-1'>
                        <Text className='text-sm text-gray-600'>{category}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
        
    )
}
export default Filter