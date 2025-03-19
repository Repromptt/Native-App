import Reviewcards from '@/components/discount';
import MenuCard from '@/components/MenuCard';
import images from '@/constants/images'
import React from 'react'
import { View ,Text, SafeAreaView, ScrollView,Image, FlatList} from 'react-native'





function menu() {
  return (
    <SafeAreaView  style={{backgroundColor: '#f2d3bd', flex: 1}} >
        <ScrollView>
              <View className='font-bold flex flex-row justify-between p-2' style={{backgroundColor: '#af8064',borderRadius:10}} >
          <Text className='text-2xl font-rubik-medium p-3'>MENU</Text>
          <Image source={images.icon} className='size-12'/>
        </View>        
        
    <View>
        <View className='flex-1 justify-end px-10 pt-5'>
          <Text className='text-3xl font-rubik-bold' style={{color: '#41221b'}}>Profile</Text>
        </View>
    </View>


          </ScrollView>
          </SafeAreaView>
  )
}

export default menu
