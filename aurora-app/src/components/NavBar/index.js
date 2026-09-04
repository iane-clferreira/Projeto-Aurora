//exemplo
import React, { useEffect, useRef } from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import * as Animatable from 'react-native-animatable';



const animate1 = {0: { scale: .5, translateY: 0 }, 1: { scale: 1.2, translateY: -24  }};
const animate2 = {0: { scale: 1.2, translateY: -24 }, 1: { scale: 1, translateY: 0 }};

const circle1 = {0: { scale: 0}, 0.3: { scale:.5}, 0.5: { scale: .3}, 0.8: { scale: .7}, 1: { scale: 1}};
const circle2 = {0: { scale: 1}, 1: { scale: 0}};

const TabButton = ({children, accessibilityState, onPress}) =>  {
    const focused = accessibilityState?.selected;
    const viewRef = useRef(null);
    const circleRef = useRef(null);

    console.log('accessibilityState:', accessibilityState);
    console.log('focused:', focused);



    useEffect(() => {
        if (!viewRef.current) return;

        viewRef.current.animate(focused ? animate1 : animate2);
        circleRef.current.animate(focused ? circle1 : circle2);
    }, [focused]);
 
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={1}
            style={styles.container}
        >
            <Animatable.View
                ref={viewRef}
                duration={1000}
                style={styles.button}
            >
                <Animatable.View 
                ref={circleRef}
                style={{...StyleSheet.absoluteFillObject, backgroundColor:'#AB00D6', borderRadius: 25}} />
                {children}
            </Animatable.View>
        </TouchableOpacity>
    )
};
    const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',

    },
    button: {
        width: 50,
        height: 50,
        borderRadius: 30,
        borderWidth: 4,
        borderColor: '#e8b3f5',
        backgroundColor: '#AB00D6',
        justifyContent: 'center',
        alignItems: 'center',

    }
   });

export default TabButton;


