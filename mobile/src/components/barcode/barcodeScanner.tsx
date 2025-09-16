import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, PixelRatio } from 'react-native';
import { CameraView, Camera } from 'expo-camera';
import { Icon } from '@rneui/base';

// Get screen dimensions
const { width, height } = Dimensions.get('window');

// Responsive helper functions
const wp = (percentage: number) => (percentage * width) / 100;
const hp = (percentage: number) => (percentage * height) / 100;
const rf = (size: number) => size * PixelRatio.getFontScale();

interface BarcodeScannerProps {
    onBarcodeScanned: (barcode: string) => void;
    onClose: () => void;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onBarcodeScanned, onClose }) => {
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [scanned, setScanned] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        const getCameraPermissions = async () => {
            const { status } = await Camera.requestCameraPermissionsAsync();
            setHasPermission(status === 'granted');
        };

        getCameraPermissions();
    }, []);

    const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
        if (scanned || isProcessing) return; // Prevent multiple calls
        
        setScanned(true);
        setIsProcessing(true);
        
        // Add a small delay to prevent rapid-fire scanning
        setTimeout(() => {
            onBarcodeScanned(data);
            setIsProcessing(false);
        }, 500);
    };

    if (hasPermission === null) {
        return (
            <View style={styles.container}>
                <Text style={styles.text}>Requesting camera permission</Text>
            </View>
        );
    }

    if (hasPermission === false) {
        return (
            <View style={styles.container}>
                <Text style={styles.text}>No access to camera</Text>
                <TouchableOpacity style={styles.button} onPress={onClose}>
                    <Text style={styles.buttonText}>Close</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                    <Icon name="close" type="ionicon" color="#fff" size={rf(24)} />
                </TouchableOpacity>
                <Text style={styles.headerText}>Scan Barcode</Text>
            </View>

            <CameraView
                style={styles.scanner}
                facing="back"
                onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                barcodeScannerSettings={{
                    barcodeTypes: ["qr", "pdf417", "ean13", "ean8", "upc_a", "upc_e", "code128", "code93"],
                }}
            />

            <View style={styles.overlay}>
                <View style={styles.scanArea} />
                <Text style={styles.instructionText}>
                    Position the barcode within the frame
                </Text>
            </View>

            {scanned && (
                <View style={styles.scannedContainer}>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => setScanned(false)}
                    >
                        <Text style={styles.buttonText}>Scan Again</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: hp(6),
        paddingHorizontal: wp(4),
        paddingBottom: hp(2),
        backgroundColor: 'rgba(0,0,0,0.8)',
    },
    closeButton: {
        padding: wp(2),
    },
    headerText: {
        flex: 1,
        textAlign: 'center',
        fontSize: rf(18),
        fontWeight: '600',
        color: '#fff',
        marginRight: wp(10), // Offset for close button
    },
    scanner: {
        flex: 1,
    },
    overlay: {
        position: 'absolute',
        top: hp(15),
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
    },
    scanArea: {
        width: wp(70),
        height: wp(50),
        borderWidth: 2,
        borderColor: '#fff',
        borderStyle: 'dashed',
        borderRadius: wp(2),
        backgroundColor: 'transparent',
    },
    instructionText: {
        marginTop: hp(2),
        fontSize: rf(16),
        color: '#fff',
        textAlign: 'center',
        backgroundColor: 'rgba(0,0,0,0.7)',
        padding: wp(2),
        borderRadius: wp(1),
    },
    text: {
        fontSize: rf(16),
        color: '#fff',
        textAlign: 'center',
        marginTop: hp(20),
    },
    scannedContainer: {
        position: 'absolute',
        bottom: hp(10),
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    button: {
        backgroundColor: '#007AFF',
        paddingHorizontal: wp(8),
        paddingVertical: hp(2),
        borderRadius: wp(2),
        marginHorizontal: wp(4),
    },
    buttonText: {
        color: '#fff',
        fontSize: rf(16),
        fontWeight: '600',
        textAlign: 'center',
    },
});

export default BarcodeScanner;