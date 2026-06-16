import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/contexts/AppContext';
import { toast } from 'sonner';
import { Lock, Phone, MapPin, CheckCircle, ArrowLeft, Loader2, CreditCard, Navigation, Clock, User, Send } from 'lucide-react';
import { PaymentQRModal } from '@/components/PaymentQRModal';

import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
const DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Helper: Map Click Handler
function LocationMarker({ position, interactive, onLocationSelect }: { position: {lat: number, lng: number} | null, interactive: boolean, onLocationSelect?: (lat: number, lng: number) => void }) {
    useMapEvents({
        click(e) {
            if (interactive && onLocationSelect) {
                onLocationSelect(e.latlng.lat, e.latlng.lng);
            }
        },
    });
    return position ? <Marker position={[position.lat, position.lng]}><Popup>Meeting Location</Popup></Marker> : null;
}

export default function TransactionDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useApp();
    
    const [request, setRequest] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isQRModalOpen, setIsQRModalOpen] = useState(false);
    
    // Default Map Center (Indore)
    const defaultCenter = { lat: 22.7196, lng: 75.8577 };
    const [tempMeetingPoint, setTempMeetingPoint] = useState<{lat: number, lng: number} | null>(null);

    // 1. Fetch Data
    useEffect(() => {
        if (!id) return;
        fetch(`http://localhost:8080/api/requests/${id}`)
            .then(res => {
                if (!res.ok) throw new Error("Transaction not found");
                return res.json();
            })
            .then(data => {
                setRequest(data);
                if (data.meetingLat) {
                    setTempMeetingPoint({ lat: data.meetingLat, lng: data.meetingLng });
                }
                setLoading(false);
            })
            .catch(() => {
                toast.error("Could not load transaction");
                navigate('/browse');
            });
    }, [id, navigate]);

    // 2. Process Payment (Only for Borrower)
    const processPaymentAPI = async () => {
        try {
            const finalPoint = tempMeetingPoint || defaultCenter;
            const res = await fetch('http://localhost:8080/api/payment/success', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    requestId: request.id,
                    lat: finalPoint.lat,
                    lng: finalPoint.lng
                })
            });
            if (!res.ok) throw new Error("Payment Failed");
        } catch (error) {
            console.error(error);
            toast.error("Payment failed on server");
            throw error;
        }
    };

    if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>;
    if (!request || !currentUser) return null;

    // --- ROLE & STATUS CHECKS ---
    const isPaid = request.paymentStatus === 'PAID';
    const isBorrower = currentUser.id === request.userId; 
    const isLender = currentUser.id === request.lenderId;

    // Permissions
    const canEditMap = isBorrower && !isPaid;

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <Button variant="ghost" className="mb-4" onClick={() => navigate(-1)}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>

                <div className="flex flex-col md:flex-row justify-between items-start mb-6">
                    <div>
                        <h1 className="text-3xl font-bold">Transaction #{request.id}</h1>
                        <p className="text-muted-foreground">Item: <span className="font-semibold text-black">{request.itemTitle}</span></p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                        <Badge className={`text-md px-4 py-1 ${isPaid ? 'bg-green-600' : 'bg-yellow-500'}`}>
                            {isPaid ? 'PAID & SECURED' : 'PAYMENT PENDING'}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                            Viewing as: {isLender ? "Lister (Owner)" : "Borrower"}
                        </span>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {/* LEFT COLUMN: Map & Contact */}
                    <div className="md:col-span-2 space-y-6">
                        
                        {/* 1. Map Card */}
                        <Card className="overflow-hidden border-2 border-blue-100 relative">
                            <CardHeader className="bg-blue-50 pb-3">
                                <CardTitle className="flex items-center gap-2 text-blue-800">
                                    <MapPin className="w-5 h-5" /> 
                                    {isPaid ? "Meeting Location Confirmed" : (isBorrower ? "Select Meeting Location" : "Waiting for Location")}
                                </CardTitle>
                            </CardHeader>
                            
                            <div className="relative h-80 w-full">
                                {/* LISTER VIEW: If Unpaid, show Waiting Overlay */}
                                {!isPaid && isLender && (
                                    <div className="absolute inset-0 z-[500] backdrop-blur-sm bg-white/60 flex flex-col items-center justify-center text-center p-6">
                                        <Clock className="w-12 h-12 text-gray-500 mb-2" />
                                        <h3 className="text-lg font-bold text-gray-700">Waiting for Borrower</h3>
                                        <p className="text-sm text-gray-600">
                                            The borrower needs to select a meeting point and complete the payment.
                                        </p>
                                    </div>
                                )}

                                <MapContainer 
                                    center={tempMeetingPoint ? [tempMeetingPoint.lat, tempMeetingPoint.lng] : [defaultCenter.lat, defaultCenter.lng]} 
                                    zoom={13} 
                                    style={{ height: "100%", width: "100%", zIndex: 0 }}
                                >
                                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                    <LocationMarker 
                                        position={tempMeetingPoint} 
                                        interactive={canEditMap}
                                        onLocationSelect={(lat, lng) => setTempMeetingPoint({lat, lng})}
                                    />
                                    {isPaid && !tempMeetingPoint && (
                                         <Marker position={[defaultCenter.lat, defaultCenter.lng]}>
                                            <Popup>Default Handover Location</Popup>
                                         </Marker>
                                    )}
                                </MapContainer>
                                
                                {canEditMap && (
                                    <div className="absolute bottom-4 left-4 right-4 bg-white/90 p-2 rounded text-center text-xs shadow-md z-[400]">
                                        Tap map to set meeting location before paying.
                                    </div>
                                )}
                            </div>
                        </Card>

                        {/* 2. Contact Info Card */}
                        <Card>
                            <CardContent className="pt-6">
                                {isPaid ? (
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-bold text-green-800 flex items-center gap-2">
                                                <Phone className="w-4 h-4" /> 
                                                {isBorrower ? "Lister's Contact Info" : "Borrower's Contact Info"}
                                            </p>
                                            <p className="text-2xl font-bold mt-1 text-black">
                                                {isBorrower ? request.lenderName : request.borrowerName}
                                            </p>
                                            
                                            {/* ✅ FIX: Removed the XXXXXXXXXX dummy text completely */}
                                            <p className="text-lg text-green-800 font-mono tracking-wide mt-1">
                                                {isBorrower ? request.lenderPhone : request.borrowerPhone}
                                            </p>
                                            
                                            <p className="text-xs text-green-700 mt-2">
                                                Payment secured. Please contact each other.
                                            </p>
                                        </div>
                                        <a 
                                            href={`tel:${isBorrower ? request.lenderPhone : request.borrowerPhone}`} 
                                            className="bg-white p-4 rounded-full shadow-md text-green-600 hover:bg-green-100 transition-colors"
                                        >
                                            <Send className="w-6 h-6" />
                                        </a>
                                    </div>
                                ) : (
                                    <div className="bg-gray-100 border border-dashed border-gray-300 rounded-lg p-6 text-center">
                                        <Lock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                        <h3 className="font-semibold text-gray-700">Contact Details Hidden</h3>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Details will be revealed once the transaction is paid.
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* RIGHT COLUMN: Action Panel */}
                    <div className="space-y-6">
                        <Card className="border-2 shadow-md">
                            <CardHeader><CardTitle>Payment Summary</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between text-sm"><span>Rental Fee</span><span>₹{request.amount || 500}</span></div>
                                <div className="border-t pt-4 flex justify-between font-bold text-lg"><span>Total</span><span>₹{request.amount || 500}</span></div>

                                {/* --- BUTTON LOGIC --- */}
                                {isPaid ? (
                                    <Button variant="outline" className="w-full bg-green-50 text-green-700 border-green-200" disabled>
                                        <CheckCircle className="w-5 h-5 mr-2" /> Paid Successfully
                                    </Button>
                                ) : (
                                    <>
                                        {/* BORROWER sees Pay Button */}
                                        {isBorrower && (
                                            <Button 
                                                className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6" 
                                                onClick={() => {
                                                    if(!tempMeetingPoint) {
                                                        toast.error("Please select a meeting point first!");
                                                        return;
                                                    }
                                                    setIsQRModalOpen(true);
                                                }}
                                            >
                                                <CreditCard className="mr-2 w-5 h-5" /> Pay Now
                                            </Button>
                                        )}

                                        {/* LISTER sees Waiting Status */}
                                        {isLender && (
                                            <Button variant="secondary" className="w-full cursor-not-allowed" disabled>
                                                <Clock className="mr-2 w-4 h-4" /> Waiting for Payment
                                            </Button>
                                        )}
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* QR MODAL (Only opens for Borrower) */}
            <PaymentQRModal 
                isOpen={isQRModalOpen} 
                onClose={() => setIsQRModalOpen(false)}
                amount={request.amount || 500}
                onPaymentComplete={processPaymentAPI}
            />
        </div>
    );
}