import { View, Text, Image } from 'react-native'
import React from 'react'
import { images } from '@/constants'


// obviously replace with photoshoped version later

const Background = () => {

  return (
  <View className='absolute  z-2 flex items-center w-screen h-1/2'>
          <Image
            tintColor={'black'}
            source={images.fruit}
            className='w-28 h-28 right-[100] bottom-[10] relative '
          />
          <Image
            tintColor={'black'}
           source={images.flower2}
           className='w-32 h-32 bottom-[110] rotate-180 left-[140] '
          />
          <Image
          tintColor={'black'}
          source={images.vine1}
           
          className='w-64 h-64 relative left-[140] bottom-5 h-60'
          />
            <Image 
               source={images.bicycle}
                style={{
                transform: `rotateZ(30deg)`
              }}
            tintColor={'black'}
            className='absolute  top-[170] right-[180] w-[120] h-[120]'
            />
            {/* re-edit plate and put in better position*/}
              <Image 
               source={images.plate}
            tintColor={'black'}
            className='absolute bottom-[5] left-[40] w-[140] h-[140]'
            style={{
              transform:'rotate(180deg)'
            }}
            />
            <Image 
               source={images.bubbles2}
            tintColor={'black'}
            className='absolute bottom-[-20] rotate-y-180 left-[-20] w-[100] h-[100]'
            />
             <Image 
               source={images.bubbles2}
            tintColor={'black'}
            className='absolute bottom-[-150] rotate-y-180 right-[20] w-[100] h-[100]'
            />
            <Image 
               source={images.stars1}
            tintColor={'black'}
            className='absolute bottom-[-200] left-[-20] w-[120] h-[120]'
        
            />
            <Image 
               source={images.stars1}
                style={{
                transform: `rotateY(180deg)`
              }}
            tintColor={'black'}
            className='absolute bottom-[-320] rotate-y-180 right-[-16] w-[120] h-[120]'
            />
             <Image
            source={images.sodaCup}
            tintColor={'black'}
            className='relative bottom-[100] left-[20] w-[240] h-[240]'
          />
            <Image
          source={images.openedBook}
          tintColor={'black'}
          className='w-64 h-64 right-[130] bottom-20 relative '
          />
           <Image 
          source={images.vine2}
           tintColor={'black'}
          className='w-64 h-64 relative 
           rotate-[-60deg] bottom-[300] right-[140] h-60'
          />
          </View>
  )
}

export default Background