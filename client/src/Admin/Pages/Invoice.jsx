import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '@/api/axiosInstance';
import { Loader2, Printer, Share2 } from 'lucide-react';
import logo1 from '@/assets/images/logo.png';
import logo from '@/assets/images/logoblack.jpeg';


const Invoice = () => {
    const { id } = useParams();
    const [invoice, setInvoice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchInvoice = async () => {
            try {
                const res = await axiosInstance.get(`/users/invoice/${id}`);
                setInvoice(res.data);
            } catch (err) {
                setError('Invoice not found.');
            } finally {
                setLoading(false);
            }
        };
        fetchInvoice();
    }, [id]);

    const handlePrint = () => {
        window.print();
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `Invoice #${invoice?._id}`,
                    url: window.location.href,
                });
            } catch (error) { console.log(error); }
        } else {
            await navigator.clipboard.writeText(window.location.href);
            alert('Link Copied!');
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-100"><Loader2 className="animate-spin text-gray-600" size={32} /></div>;
    if (error) return <div className="min-h-screen flex items-center justify-center text-red-600 font-bold">{error}</div>;

    // --- Helpers ---
    const formatCurrency = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount || 0);
    const total = invoice.totalAmount || invoice.amount || 0;
    const paid = invoice.paidAmount || invoice.amount || 0;
    const due = total - paid;
    const isPaid = due <= 0;
    const invoiceDate = new Date(invoice.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const startDate = new Date(invoice.startDate).toLocaleDateString('en-GB');
    const endDate = new Date(invoice.endDate).toLocaleDateString('en-GB');

    return (
        <div className="min-h-screen bg-gray-100 py-6 px-4 md:py-10 print:p-0 print:bg-white font-sans text-gray-800">
            
            {/* --- Toolbar (Hidden on Print) --- */}
            {/* <div className="max-w-[210mm] mx-auto mb-6 flex flex-col sm:flex-row justify-between items-center gap-4 print:hidden">
                <div className="text-sm text-gray-500 font-medium">Invoice Preview</div>
                <div className="flex gap-3 w-full sm:w-auto">
                    <button onClick={handleShare} className="flex-1 sm:flex-none justify-center flex items-center gap-2 bg-white text-gray-700 px-4 py-2 rounded shadow-sm border hover:bg-gray-50 text-sm font-medium">
                        <Share2 size={16} /> Share
                    </button>
                    <button onClick={handlePrint} className="flex-1 sm:flex-none justify-center flex items-center gap-2 bg-black text-white px-5 py-2 rounded shadow-sm hover:bg-gray-800 text-sm font-medium">
                        <Printer size={16} /> Print
                    </button>
                </div>
            </div> */}

            {/* --- Paper Wrapper (Responsive + A4) --- */}
            <div className="w-full md:w-[210mm] md:min-h-[297mm] mx-auto bg-white shadow-lg rounded-lg overflow-hidden relative flex flex-col print:shadow-none print:w-[210mm] print:min-h-[297mm] print:rounded-none">
                
                {/* --- WATERMARK --- */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                    <img 
                        src={logo1} 
                        alt="Watermark" 
                        className="w-[60%] opacity-[0.03] grayscale"
                    />
                </div>

                {/* --- CONTENT LAYER --- */}
                <div className="relative z-10 p-6 md:p-12 h-full flex flex-col flex-grow">
                    
                    {/* 1. Header & Address */}
                    <div className="flex flex-col md:flex-row justify-between items-start border-b-2 border-gray-400 pb-6 md:pb-8 gap-6">
                        {/* Logo Section */}
                        <div className="w-full md:w-auto flex flex-col items-center md:items-start text-center md:text-left">
                            <img src={logo} alt="Logo" className="h-16 md:h-24 w-auto object-contain mb-2" />
                            <h1 className="text-2xl md:text-2xl font-bold text-gray-900 tracking-tight uppercase mt-1">Invoice</h1>
                        </div>

                        {/* Address Section */}
                        <div className="w-full md:w-auto text-center md:text-right text-sm text-gray-600 leading-relaxed">
                            <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-1 md:mb-2">Hp Fitness Studio Unisex</h2>
                            <p>First floor, No:252, Mahatma Gandhi Rd,</p>
                            <p>Kottakuppam, Tamil Nadu 605104</p>
                            <p className="mt-2">hariprasath0225@gmail.com</p>
                            <p className="font-medium text-gray-900">+91 97877 55755</p>
                        </div>
                    </div>

                    {/* 2. Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 mt-8 md:mt-6">
                        {/* Billed To */}
                        <div className="text-center md:text-left">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Billed To</p>
                            <h3 className="text-xl font-bold text-gray-900">{invoice.user?.name}</h3>
                            <p className="text-sm text-gray-600 mt-1">Customer ID: <span className="font-medium text-gray-800">{invoice.user?.customerId}</span></p>
                            <p className="text-sm text-gray-600">{invoice.user?.phoneNumber}</p>
                        </div>

                        {/* Invoice Metadata */}
                        <div className="grid grid-cols-2 gap-y-4 gap-x-4 md:text-right text-sm">
                            <div className="text-left md:text-right">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Date</p>
                                <p className="font-bold text-gray-900">{invoiceDate}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Payment Via</p>
                                <p className="font-bold text-gray-900 capitalize">{invoice.paymentMode}</p>
                            </div>
                            <div className="col-span-2 mt-2 text-center md:text-right">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Status</p>
                                <span className={`inline-block py-1 rounded text-xs font-bold uppercase tracking-wide ${isPaid ? 'text-green-700' : 'text-red-700'}`}>
                                    {isPaid ? 'Paid' : 'Payment Due'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* 3. Table */}
                    <div className="mt-8 md:mt-8 overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[300px]">
                            <thead>
                                <tr className="border-b-2 border-gray-400">
                                    <th className="py-3 text-xs md:text-sm font-bold text-gray-900 uppercase tracking-wide w-1/2">Plan Name</th>
                                    <th className="py-3 text-xs md:text-sm font-bold text-gray-900 uppercase tracking-wide text-center">Period</th>
                                    <th className="py-3 text-xs md:text-sm font-bold text-gray-900 uppercase tracking-wide text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-gray-200">
                                    <td className="py-4 md:py-5 pr-2 md:pr-4 align-top">
                                        <p className="font-bold text-gray-900 text-sm md:text-lg">{invoice.planName}</p>
                                        <p className="text-[10px] md:text-xs text-gray-500 mt-1 uppercase tracking-wide">Gym Subscription Package</p>
                                    </td>
                                    <td className="py-4 md:py-5 text-center align-top text-xs md:text-sm font-medium text-gray-600 whitespace-nowrap">
                                        {startDate} <br className="md:hidden"/> — <br className="md:hidden"/> {endDate}
                                    </td>
                                    <td className="py-4 md:py-5 text-right align-top font-bold text-gray-900 text-sm md:text-lg">
                                        {formatCurrency(invoice.packageFee || total)}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* 4. Financials */}
                    <div className="mt-6 flex flex-col md:flex-row justify-end">
                        <div className="w-full md:w-5/12 space-y-3">
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Subtotal</span>
                                <span className="font-medium">{formatCurrency(invoice.packageFee || total)}</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Tax (0%)</span>
                                <span>₹0.00</span>
                            </div>
                            <div className="border-t border-gray-300 my-2"></div>
                            <div className="flex justify-between items-center">
                                <span className="text-base md:text-lg font-bold text-gray-900">Total</span>
                                <span className="text-xl md:text-2xl font-bold text-gray-900">{formatCurrency(total)}</span>
                            </div>
                            
                            <div className="bg-gray-50 p-4 rounded border border-gray-200 mt-4">
                                <div className="flex justify-between text-sm font-bold text-green-700">
                                    <span>Amount Paid</span>
                                    <span>{formatCurrency(paid)}</span>
                                </div>
                                {due > 0 && (
                                    <div className="flex justify-between text-sm md:text-base font-bold text-red-700 mt-2 pt-2 border-t border-gray-200">
                                        <span>Balance Due</span>
                                        <span>{formatCurrency(due)}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>


                    {/* 5. Footer */}
                    <div className="mt-5 pt-10 border-t-2 border-gray-400">
                        <div className="flex flex-col md:flex-row justify-between items-center md:items-end gap-6 text-center md:text-left">
                            <div className="text-xs text-gray-500 max-w-xs">
                                <p className="font-bold text-gray-900 uppercase mb-1">Terms & Conditions</p>
                                <ul className="list-disc pl-3 space-y-1 text-left inline-block">
                                    <li>Fees are non-refundable.</li>
                                    <li>Please retain this invoice for your records.</li>
                                </ul>
                            </div>
                            <div className="text-center md:text-right">
                                <p className="text-base md:text-lg capitalize font-script text-gray-900">{invoice.billedBy || 'Administrator'}</p>
                                <p className="text-xs font-bold text-gray-400 uppercase mt-1">Billing by</p>
                            </div>
                        </div>
                        <div className="text-center text-[10px] text-gray-400 uppercase tracking-widest mt-8 md:mt-10">
                            Hp Fitness Studio Unisex &copy; {new Date().getFullYear()}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Invoice;