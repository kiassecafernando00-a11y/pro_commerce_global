
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import axios from "axios";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";

const BINANCE_API_KEY = process.env.BINANCE_API_KEY;
const BINANCE_SECRET_KEY = process.env.BINANCE_SECRET_KEY;
const BINANCE_BASE_URL = "https://bpay.binanceapi.com"; // User might need to switch to testnet if available

function hashSignature(payload: string, secret: string) {
    return crypto.createHmac("sha512", secret).update(payload).digest("hex").toUpperCase();
}

function randomString() {
    return crypto.randomBytes(16).toString("hex");
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (!BINANCE_API_KEY || !BINANCE_SECRET_KEY) {
            // Return a simulation if keys are missing (to prevent crashing app during demo)
            return NextResponse.json({
                simulation: true,
                checkoutUrl: "https://pay.binance.com/checkout/mock-simulation",
                qrCodeUrl: "https://chart.googleapis.com/chart?chs=200x200&cht=qr&chl=MockBinancePayment"
            });
        }

        const { amount, currency, orderId } = await req.json();

        // Binance Pay Payload
        const payload = {
            merchantTradeNo: orderId || randomString(),
            orderAmount: amount.toFixed(2),
            currency: currency, // e.g. "USDT" or "USD"
            goods: {
                goodsType: "01",
                goodsCategory: "1000",
                referenceGoodsId: "prod_1",
                goodsName: "ProCommerce Purchase",
                goodsDetail: "E-commerce Order"
            }
        };

        const timestamp = Date.now();
        const nonce = randomString();
        const payloadStr = JSON.stringify(payload);

        // Construct signature string: timestamp + \n + nonce + \n + body + \n
        const signaturePayload = `${timestamp}\n${nonce}\n${payloadStr}\n`;
        const signature = hashSignature(signaturePayload, BINANCE_SECRET_KEY);

        const response = await axios.post(`${BINANCE_BASE_URL}/binancepay/openapi/v2/order`, payload, {
            headers: {
                "Content-Type": "application/json",
                "BinancePay-Timestamp": timestamp,
                "BinancePay-Nonce": nonce,
                "BinancePay-Certificate-SN": BINANCE_API_KEY,
                "BinancePay-Signature": signature
            }
        });

        if (response.data.status === "SUCCESS") {
            return NextResponse.json({
                checkoutUrl: response.data.data.checkoutUrl,
                qrCodeUrl: response.data.data.qrcodeLink
            });
        } else {
            throw new Error(response.data.errorMessage || "Binance Pay Error");
        }

    } catch (error: any) {
        console.error("Binance Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
