import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Exchange and Return Policy | DrinkMates",
  description: "Learn about our exchange and return policy for flavors, CO2 cylinders, and related beverage products.",
}

export default function ExchangeAndReturnPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Exchange and Return Policy</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-sm text-gray-600 mb-8">
              <strong>Effective Date:</strong> September 2022
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">The Introduction</h2>
              <p className="text-gray-700 mb-4">
                Please read these terms carefully to ensure that you understand each clause before using the "Aqualine" platform, as they affect your legal rights.
              </p>
              <p className="text-gray-700 mb-4">
                These Terms of Use together with the Privacy Policy (collectively "Terms and Conditions") govern your access to and use of the Aqualine Platform, its features, and services.
              </p>
              <p className="text-gray-700 mb-4">
                By registering an account or using the "Aqualine" platform, you confirm to us that you have read and understood these terms and agree to abide by them. If you do not agree to these terms, please do not use the platform.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Cancellation and Returns Policy</h2>
              
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
                <p className="text-blue-800 font-semibold">
                  "Aqualine" platform reserves the exclusive right to refuse or cancel any order for flavors, CO2 cylinders, and related beverage products listed at an incorrect or unavailable price, regardless of order confirmation or payment confirmation. In such cases, if the payment is processed, the amount will be refunded to the consumer in the same original payment method.
                </p>
              </div>

              <ul className="list-disc list-inside space-y-3 text-gray-700">
                <li>The consumer can cancel the order unless it is accepted or processed by the service provider.</li>
                <li>
                  The "Aqualine" platform does not provide or sell any products to the consumer, but rather the products are provided by service providers, who are completely independent in performing their work, and therefore the return and exchange policy of service providers will apply, and the consumer acknowledges and agrees that it may differ from one service provider to another.
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Purchase Policy</h2>
              <ul className="list-disc list-inside space-y-3 text-gray-700">
                <li>People who can legally enter into contracts online in accordance with the laws of the Kingdom of Saudi Arabia can purchase products through the "Aqualine" platform.</li>
                <li>All product data, including prices, availability, and images, is provided and updated directly from the service providers (suppliers and distributors).</li>
                <li>The offered products must be compatible with health and safety standards, authorized to be traded and sold in the Kingdom of Saudi Arabia, and guaranteed to be free of any harmful causes.</li>
                <li>The products must be healthy and usable, and the service provider must explain all their characteristics and suitability for use.</li>
                <li>Some products may have limited quantities.</li>
                <li>Some errors may occur during the process of providing products or providing detailed information about prices on the platform by service providers, so we do not bear responsibility for any errors you find while completing the order, and the platform will send a notification to the service provider to correct the errors.</li>
                <li>The Consumer agrees to pay for the Products as stated during the order process, along with any shipping costs or other fees applicable to such order.</li>
                <li>In some cases, a consumer's order may not be accepted for the following reasons:
                  <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                    <li>Product unavailability.</li>
                    <li>Stolen payments or payment fraud.</li>
                    <li>If there is an error in the images, price or description of the product on the platform.</li>
                    <li>If there was an error when listing a product in a sale or promotion.</li>
                  </ul>
                </li>
                <li>It is the consumer's responsibility to monitor the status of your order.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Shipping Policy</h2>
              <ul className="list-disc list-inside space-y-3 text-gray-700">
                <li>Orders are shipped to the consumer's specified address within 3 business days after confirmation by the seller.</li>
                <li>The consumer bears the order delivery fees in addition to the price of the products.</li>
                <li>The shipping process may be delayed for reasons related to force majeure or circumstances beyond our control. In this case, we will not bear any responsibilities as a result of delayed delivery of the order. You will be notified of the delay via email or phone by the seller.</li>
                <li>Please see the list of cities that are shipped to through approved shipping companies.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Prices and Taxes Policy</h2>
              <ul className="list-disc list-inside space-y-3 text-gray-700">
                <li>All prices of products displayed on the "Aqualine" platform are in the local currency (Saudi Riyal).</li>
                <li>Prices are subject to modification and updating by the service provider.</li>
                <li>Prices include 15% VAT on purchase orders. Any change in the applicable VAT rate will be automatically reflected in the product price.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Information</h2>
              <p className="text-gray-700 mb-4">
                If you have any questions about our exchange and return policy, please contact us:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">
                  <strong>Email:</strong> support@drinkmates.com<br />
                  <strong>Phone:</strong> +966 XX XXX XXXX<br />
                  <strong>Address:</strong> Kingdom of Saudi Arabia
                </p>
              </div>
            </section>

            <div className="border-t border-gray-200 pt-6 mt-8">
              <p className="text-sm text-gray-500">
                All rights reserved to Aqualine 2025.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
