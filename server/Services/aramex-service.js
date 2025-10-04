const axios = require('axios');
const xml2js = require('xml2js');

class AramexService {
    constructor() {
        this.baseURL = process.env.ARAMEX_API_URL || 'http://ws.sbx.aramex.net/shippingapi/shipping/service_1_0.svc';
        this.wsdlURL = 'https://ws.sbx.aramex.net/ShippingAPI/Shipping/Service_1_0.svc?wsdl';
        
        // Aramex credentials from environment variables
        this.credentials = {
            AccountCountryCode: process.env.ARAMEX_ACCOUNT_COUNTRY_CODE || 'SA',
            AccountEntity: process.env.ARAMEX_ACCOUNT_ENTITY || 'RUH',
            AccountNumber: process.env.ARAMEX_ACCOUNT_NUMBER || '4004636',
            AccountPin: process.env.ARAMEX_ACCOUNT_PIN || '432432',
            UserName: process.env.ARAMEX_USERNAME || 'testingapi@aramex.com',
            Password: process.env.ARAMEX_PASSWORD || 'R123456789$r',
            Version: process.env.ARAMEX_VERSION || '1.0'
        };
        
        this.xmlBuilder = new xml2js.Builder({
            xmldec: { version: '1.0', encoding: 'UTF-8' },
            renderOpts: { pretty: true, indent: '  ', newline: '\n' }
        });
    }

    /**
     * Track shipment by waybill number
     * @param {string} waybillNumber - The Aramex waybill number
     * @returns {Promise<Object>} Tracking information
     */
    async trackShipment(waybillNumber) {
        try {
            const soapEnvelope = this.buildTrackShipmentRequest(waybillNumber);
            
            const response = await axios.post(this.baseURL, soapEnvelope, {
                headers: {
                    'Content-Type': 'text/xml; charset=utf-8',
                    'SOAPAction': 'http://ws.aramex.net/ShippingAPI/v1/Service_1_0/TrackShipments'
                },
                timeout: 30000
            });

            const result = await this.parseSoapResponse(response.data);
            return this.formatTrackingResponse(result);
            
        } catch (error) {
            console.error('Aramex tracking error:', error);
            throw new Error(`Failed to track shipment: ${error.message}`);
        }
    }

    /**
     * Create shipment and get tracking number
     * @param {Object} shipmentData - Shipment details
     * @returns {Promise<Object>} Shipment creation response
     */
    async createShipment(shipmentData) {
        try {
            const soapEnvelope = this.buildCreateShipmentRequest(shipmentData);
            
            const response = await axios.post(this.baseURL, soapEnvelope, {
                headers: {
                    'Content-Type': 'text/xml; charset=utf-8',
                    'SOAPAction': 'http://ws.aramex.net/ShippingAPI/v1/Service_1_0/CreateShipments'
                },
                timeout: 30000
            });

            const result = await this.parseSoapResponse(response.data);
            return this.formatShipmentResponse(result);
            
        } catch (error) {
            console.error('Aramex shipment creation error:', error);
            throw new Error(`Failed to create shipment: ${error.message}`);
        }
    }

    /**
     * Get shipment history
     * @param {string} waybillNumber - The Aramex waybill number
     * @returns {Promise<Object>} Shipment history
     */
    async getShipmentHistory(waybillNumber) {
        try {
            const soapEnvelope = this.buildTrackShipmentRequest(waybillNumber);
            
            const response = await axios.post(this.baseURL, soapEnvelope, {
                headers: {
                    'Content-Type': 'text/xml; charset=utf-8',
                    'SOAPAction': 'http://ws.aramex.net/ShippingAPI/v1/Service_1_0/TrackShipments'
                },
                timeout: 30000
            });

            const result = await this.parseSoapResponse(response.data);
            return this.formatHistoryResponse(result);
            
        } catch (error) {
            console.error('Aramex history error:', error);
            throw new Error(`Failed to get shipment history: ${error.message}`);
        }
    }

    /**
     * Build SOAP request for tracking shipments
     */
    buildTrackShipmentRequest(waybillNumber) {
        const soapBody = {
            'soap:Envelope': {
                '$': {
                    'xmlns:soap': 'http://schemas.xmlsoap.org/soap/envelope/',
                    'xmlns:ns': 'http://ws.aramex.net/ShippingAPI/v1/'
                },
                'soap:Header': {},
                'soap:Body': {
                    'ns:TrackShipments': {
                        'ns:ClientInfo': {
                            'ns:AccountCountryCode': this.credentials.AccountCountryCode,
                            'ns:AccountEntity': this.credentials.AccountEntity,
                            'ns:AccountNumber': this.credentials.AccountNumber,
                            'ns:AccountPin': this.credentials.AccountPin,
                            'ns:UserName': this.credentials.UserName,
                            'ns:Password': this.credentials.Password,
                            'ns:Version': this.credentials.Version
                        },
                        'ns:Transaction': {
                            'ns:Reference1': 'TrackShipment',
                            'ns:Reference2': new Date().toISOString(),
                            'ns:Reference3': '',
                            'ns:Reference4': '',
                            'ns:Reference5': ''
                        },
                        'ns:Shipments': {
                            'ns:string': waybillNumber
                        },
                        'ns:GetLastTrackingUpdateOnly': false
                    }
                }
            }
        };

        return this.xmlBuilder.buildObject(soapBody);
    }

    /**
     * Build SOAP request for creating shipments
     */
    buildCreateShipmentRequest(shipmentData) {
        const soapBody = {
            'soap:Envelope': {
                '$': {
                    'xmlns:soap': 'http://schemas.xmlsoap.org/soap/envelope/',
                    'xmlns:ns': 'http://ws.aramex.net/ShippingAPI/v1/'
                },
                'soap:Header': {},
                'soap:Body': {
                    'ns:CreateShipments': {
                        'ns:ClientInfo': {
                            'ns:AccountCountryCode': this.credentials.AccountCountryCode,
                            'ns:AccountEntity': this.credentials.AccountEntity,
                            'ns:AccountNumber': this.credentials.AccountNumber,
                            'ns:AccountPin': this.credentials.AccountPin,
                            'ns:UserName': this.credentials.UserName,
                            'ns:Password': this.credentials.Password,
                            'ns:Version': this.credentials.Version
                        },
                        'ns:Transaction': {
                            'ns:Reference1': 'CreateShipment',
                            'ns:Reference2': new Date().toISOString(),
                            'ns:Reference3': '',
                            'ns:Reference4': '',
                            'ns:Reference5': ''
                        },
                        'ns:Shipments': {
                            'ns:Shipment': {
                                'ns:Shipper': {
                                    'ns:Reference1': shipmentData.shipper?.reference1 || 'DrinkMate',
                                    'ns:Reference2': shipmentData.shipper?.reference2 || '',
                                    'ns:AccountNumber': this.credentials.AccountNumber,
                                    'ns:PartyAddress': {
                                        'ns:Line1': shipmentData.shipper?.address?.line1 || '',
                                        'ns:Line2': shipmentData.shipper?.address?.line2 || '',
                                        'ns:Line3': shipmentData.shipper?.address?.line3 || '',
                                        'ns:City': shipmentData.shipper?.address?.city || 'Riyadh',
                                        'ns:StateOrProvinceCode': shipmentData.shipper?.address?.state || 'Riyadh',
                                        'ns:PostCode': shipmentData.shipper?.address?.postCode || '',
                                        'ns:CountryCode': shipmentData.shipper?.address?.countryCode || 'SA'
                                    },
                                    'ns:Contact': {
                                        'ns:Department': shipmentData.shipper?.contact?.department || '',
                                        'ns:PersonName': shipmentData.shipper?.contact?.personName || 'DrinkMate Support',
                                        'ns:Title': shipmentData.shipper?.contact?.title || '',
                                        'ns:CompanyName': shipmentData.shipper?.contact?.companyName || 'DrinkMate',
                                        'ns:PhoneNumber1': shipmentData.shipper?.contact?.phoneNumber1 || '',
                                        'ns:PhoneNumber1Ext': shipmentData.shipper?.contact?.phoneNumber1Ext || '',
                                        'ns:PhoneNumber2': shipmentData.shipper?.contact?.phoneNumber2 || '',
                                        'ns:PhoneNumber2Ext': shipmentData.shipper?.contact?.phoneNumber2Ext || '',
                                        'ns:FaxNumber': shipmentData.shipper?.contact?.faxNumber || '',
                                        'ns:CellPhone': shipmentData.shipper?.contact?.cellPhone || '',
                                        'ns:EmailAddress': shipmentData.shipper?.contact?.emailAddress || 'support@drinkmate.com',
                                        'ns:Type': shipmentData.shipper?.contact?.type || ''
                                    }
                                },
                                'ns:Consignee': {
                                    'ns:Reference1': shipmentData.consignee?.reference1 || '',
                                    'ns:Reference2': shipmentData.consignee?.reference2 || '',
                                    'ns:AccountNumber': shipmentData.consignee?.accountNumber || '',
                                    'ns:PartyAddress': {
                                        'ns:Line1': shipmentData.consignee?.address?.line1 || '',
                                        'ns:Line2': shipmentData.consignee?.address?.line2 || '',
                                        'ns:Line3': shipmentData.consignee?.address?.line3 || '',
                                        'ns:City': shipmentData.consignee?.address?.city || '',
                                        'ns:StateOrProvinceCode': shipmentData.consignee?.address?.state || '',
                                        'ns:PostCode': shipmentData.consignee?.address?.postCode || '',
                                        'ns:CountryCode': shipmentData.consignee?.address?.countryCode || 'SA'
                                    },
                                    'ns:Contact': {
                                        'ns:Department': shipmentData.consignee?.contact?.department || '',
                                        'ns:PersonName': shipmentData.consignee?.contact?.personName || '',
                                        'ns:Title': shipmentData.consignee?.contact?.title || '',
                                        'ns:CompanyName': shipmentData.consignee?.contact?.companyName || '',
                                        'ns:PhoneNumber1': shipmentData.consignee?.contact?.phoneNumber1 || '',
                                        'ns:PhoneNumber1Ext': shipmentData.consignee?.contact?.phoneNumber1Ext || '',
                                        'ns:PhoneNumber2': shipmentData.consignee?.contact?.phoneNumber2 || '',
                                        'ns:PhoneNumber2Ext': shipmentData.consignee?.contact?.phoneNumber2Ext || '',
                                        'ns:FaxNumber': shipmentData.consignee?.contact?.faxNumber || '',
                                        'ns:CellPhone': shipmentData.consignee?.contact?.cellPhone || '',
                                        'ns:EmailAddress': shipmentData.consignee?.contact?.emailAddress || '',
                                        'ns:Type': shipmentData.consignee?.contact?.type || ''
                                    }
                                },
                                'ns:ThirdParty': {
                                    'ns:Reference1': shipmentData.thirdParty?.reference1 || '',
                                    'ns:Reference2': shipmentData.thirdParty?.reference2 || '',
                                    'ns:AccountNumber': shipmentData.thirdParty?.accountNumber || '',
                                    'ns:PartyAddress': {
                                        'ns:Line1': shipmentData.thirdParty?.address?.line1 || '',
                                        'ns:Line2': shipmentData.thirdParty?.address?.line2 || '',
                                        'ns:Line3': shipmentData.thirdParty?.address?.line3 || '',
                                        'ns:City': shipmentData.thirdParty?.address?.city || '',
                                        'ns:StateOrProvinceCode': shipmentData.thirdParty?.address?.state || '',
                                        'ns:PostCode': shipmentData.thirdParty?.address?.postCode || '',
                                        'ns:CountryCode': shipmentData.thirdParty?.address?.countryCode || 'SA'
                                    },
                                    'ns:Contact': {
                                        'ns:Department': shipmentData.thirdParty?.contact?.department || '',
                                        'ns:PersonName': shipmentData.thirdParty?.contact?.personName || '',
                                        'ns:Title': shipmentData.thirdParty?.contact?.title || '',
                                        'ns:CompanyName': shipmentData.thirdParty?.contact?.companyName || '',
                                        'ns:PhoneNumber1': shipmentData.thirdParty?.contact?.phoneNumber1 || '',
                                        'ns:PhoneNumber1Ext': shipmentData.thirdParty?.contact?.phoneNumber1Ext || '',
                                        'ns:PhoneNumber2': shipmentData.thirdParty?.contact?.phoneNumber2 || '',
                                        'ns:PhoneNumber2Ext': shipmentData.thirdParty?.contact?.phoneNumber2Ext || '',
                                        'ns:FaxNumber': shipmentData.thirdParty?.contact?.faxNumber || '',
                                        'ns:CellPhone': shipmentData.thirdParty?.contact?.cellPhone || '',
                                        'ns:EmailAddress': shipmentData.thirdParty?.contact?.emailAddress || '',
                                        'ns:Type': shipmentData.thirdParty?.contact?.type || ''
                                    }
                                },
                                'ns:Reference1': shipmentData.reference1 || '',
                                'ns:Reference2': shipmentData.reference2 || '',
                                'ns:Reference3': shipmentData.reference3 || '',
                                'ns:ForeignHAWB': shipmentData.foreignHAWB || '',
                                'ns:TransportType': shipmentData.transportType || 0,
                                'ns:ShippingDateTime': shipmentData.shippingDateTime || new Date().toISOString(),
                                'ns:DueDate': shipmentData.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                                'ns:Attachments': shipmentData.attachments || '',
                                'ns:PickupLocation': shipmentData.pickupLocation || '',
                                'ns:PickupGUID': shipmentData.pickupGUID || '',
                                'ns:Comments': shipmentData.comments || '',
                                'ns:AccountingInstructions': shipmentData.accountingInstructions || '',
                                'ns:OperationsInstructions': shipmentData.operationsInstructions || '',
                                'ns:Details': {
                                    'ns:Dimensions': {
                                        'ns:Length': shipmentData.details?.dimensions?.length || 10,
                                        'ns:Width': shipmentData.details?.dimensions?.width || 10,
                                        'ns:Height': shipmentData.details?.dimensions?.height || 10,
                                        'ns:Unit': shipmentData.details?.dimensions?.unit || 'CM'
                                    },
                                    'ns:ActualWeight': {
                                        'ns:Value': shipmentData.details?.actualWeight?.value || 1,
                                        'ns:Unit': shipmentData.details?.actualWeight?.unit || 'KG'
                                    },
                                    'ns:ProductGroup': shipmentData.details?.productGroup || 'DOM',
                                    'ns:ProductType': shipmentData.details?.productType || 'ONX',
                                    'ns:PaymentType': shipmentData.details?.paymentType || 'P',
                                    'ns:PaymentOptions': shipmentData.details?.paymentOptions || '',
                                    'ns:Services': shipmentData.details?.services || '',
                                    'ns:NumberOfPieces': shipmentData.details?.numberOfPieces || 1,
                                    'ns:DescriptionOfGoods': shipmentData.details?.descriptionOfGoods || 'DrinkMate Products',
                                    'ns:GoodsOriginCountry': shipmentData.details?.goodsOriginCountry || 'SA',
                                    
                                    // Additional fields from sample code
                                    'ns:CashOnDeliveryAmount': {
                                        'ns:Value': shipmentData.details?.cashOnDeliveryAmount?.value || 0,
                                        'ns:CurrencyCode': shipmentData.details?.cashOnDeliveryAmount?.currencyCode || 'SAR'
                                    },
                                    'ns:InsuranceAmount': {
                                        'ns:Value': shipmentData.details?.insuranceAmount?.value || 0,
                                        'ns:CurrencyCode': shipmentData.details?.insuranceAmount?.currencyCode || 'SAR'
                                    },
                                    'ns:CollectAmount': {
                                        'ns:Value': shipmentData.details?.collectAmount?.value || 0,
                                        'ns:CurrencyCode': shipmentData.details?.collectAmount?.currencyCode || 'SAR'
                                    },
                                    'ns:CashAdditionalAmount': {
                                        'ns:Value': shipmentData.details?.cashAdditionalAmount?.value || 0,
                                        'ns:CurrencyCode': shipmentData.details?.cashAdditionalAmount?.currencyCode || 'SAR'
                                    },
                                    'ns:CashAdditionalAmountDescription': shipmentData.details?.cashAdditionalAmountDescription || '',
                                    'ns:CustomsValueAmount': {
                                        'ns:Value': shipmentData.details?.customsValueAmount?.value || 0,
                                        'ns:CurrencyCode': shipmentData.details?.customsValueAmount?.currencyCode || 'SAR'
                                    },
                                    'ns:Items': shipmentData.details?.items || []
                                },
                                'ns:Attachments': shipmentData.attachments || '',
                                'ns:ForeignHAWB': shipmentData.foreignHAWB || ''
                            }
                        },
                        'ns:LabelInfo': {
                            'ns:ReportID': 9201,
                            'ns:ReportType': 'URL'
                        }
                    }
                }
            }
        };

        return this.xmlBuilder.buildObject(soapBody);
    }

    /**
     * Parse SOAP response
     */
    async parseSoapResponse(xmlData) {
        try {
            const parser = new xml2js.Parser({
                explicitArray: false,
                mergeAttrs: true
            });
            
            const result = await parser.parseStringPromise(xmlData);
            return result;
        } catch (error) {
            console.error('SOAP parsing error:', error);
            throw new Error('Failed to parse SOAP response');
        }
    }

    /**
     * Format tracking response
     */
    formatTrackingResponse(soapResult) {
        try {
            const envelope = soapResult['soap:Envelope'] || soapResult['soap:envelope'];
            const body = envelope['soap:Body'] || envelope['soap:body'];
            const trackResponse = body['ns:TrackShipmentsResponse'] || body['ns:trackShipmentsResponse'];
            
            if (!trackResponse) {
                throw new Error('Invalid SOAP response structure');
            }

            const shipments = trackResponse['ns:Shipments'] || trackResponse['ns:shipments'];
            const trackingResults = shipments['ns:KeyValueOfstringArrayOfTrackingResultmFAkxlpY'] || 
                                  shipments['ns:keyValueOfstringArrayOfTrackingResultmFAkxlpY'] || [];

            const formattedResults = Array.isArray(trackingResults) ? trackingResults : [trackingResults];

            return {
                success: true,
                shipments: formattedResults.map(shipment => ({
                    waybillNumber: shipment['ns:Key'] || shipment['ns:key'],
                    trackingResults: this.formatTrackingResults(shipment['ns:Value'] || shipment['ns:value'])
                }))
            };
        } catch (error) {
            console.error('Error formatting tracking response:', error);
            return {
                success: false,
                error: 'Failed to format tracking response',
                details: error.message
            };
        }
    }

    /**
     * Format tracking results
     */
    formatTrackingResults(trackingData) {
        if (!trackingData) return [];
        
        const results = trackingData['ns:TrackingResult'] || trackingData['ns:trackingResult'] || [];
        const trackingResults = Array.isArray(results) ? results : [results];

        return trackingResults.map(result => ({
            waybillNumber: result['ns:WaybillNumber'] || result['ns:waybillNumber'],
            updateCode: result['ns:UpdateCode'] || result['ns:updateCode'],
            updateDescription: result['ns:UpdateDescription'] || result['ns:updateDescription'],
            updateDateTime: result['ns:UpdateDateTime'] || result['ns:updateDateTime'],
            updateLocation: result['ns:UpdateLocation'] || result['ns:updateLocation'],
            comments: result['ns:Comments'] || result['ns:comments'],
            problemCode: result['ns:ProblemCode'] || result['ns:problemCode']
        }));
    }

    /**
     * Format shipment creation response
     */
    formatShipmentResponse(soapResult) {
        try {
            const envelope = soapResult['soap:Envelope'] || soapResult['soap:envelope'];
            const body = envelope['soap:Body'] || envelope['soap:body'];
            const createResponse = body['ns:CreateShipmentsResponse'] || body['ns:createShipmentsResponse'];
            
            if (!createResponse) {
                throw new Error('Invalid SOAP response structure');
            }

            const shipments = createResponse['ns:Shipments'] || createResponse['ns:shipments'];
            const shipmentResults = shipments['ns:ProcessedShipment'] || shipments['ns:processedShipment'] || [];

            const formattedResults = Array.isArray(shipmentResults) ? shipmentResults : [shipmentResults];

            return {
                success: true,
                shipments: formattedResults.map(shipment => ({
                    id: shipment['ns:ID'] || shipment['ns:id'],
                    waybillNumber: shipment['ns:WaybillNumber'] || shipment['ns:waybillNumber'],
                    labelUrl: shipment['ns:LabelURL'] || shipment['ns:labelURL'],
                    status: shipment['ns:Status'] || shipment['ns:status']
                }))
            };
        } catch (error) {
            console.error('Error formatting shipment response:', error);
            return {
                success: false,
                error: 'Failed to format shipment response',
                details: error.message
            };
        }
    }

    /**
     * Format history response
     */
    formatHistoryResponse(soapResult) {
        // Similar to tracking response but focused on historical data
        return this.formatTrackingResponse(soapResult);
    }

    /**
     * Create pickup request
     */
    async createPickup(pickupData) {
        try {
            const soapEnvelope = this.buildCreatePickupRequest(pickupData);
            
            const response = await axios.post(this.baseURL, soapEnvelope, {
                headers: {
                    'Content-Type': 'text/xml; charset=utf-8',
                    'SOAPAction': 'http://ws.aramex.net/ShippingAPI/v1/Service_1_0/CreatePickup'
                },
                timeout: 30000
            });

            const result = await this.parseSoapResponse(response.data);
            return this.formatPickupResponse(result);
            
        } catch (error) {
            console.error('Aramex pickup creation error:', error);
            throw new Error(`Failed to create pickup: ${error.message}`);
        }
    }

    /**
     * Cancel pickup request
     */
    async cancelPickup(pickupData) {
        try {
            const soapEnvelope = this.buildCancelPickupRequest(pickupData);
            
            const response = await axios.post(this.baseURL, soapEnvelope, {
                headers: {
                    'Content-Type': 'text/xml; charset=utf-8',
                    'SOAPAction': 'http://ws.aramex.net/ShippingAPI/v1/Service_1_0/CancelPickup'
                },
                timeout: 30000
            });

            const result = await this.parseSoapResponse(response.data);
            return this.formatCancelPickupResponse(result);
            
        } catch (error) {
            console.error('Aramex pickup cancellation error:', error);
            throw new Error(`Failed to cancel pickup: ${error.message}`);
        }
    }

    /**
     * Print label
     */
    async printLabel(labelData) {
        try {
            const soapEnvelope = this.buildPrintLabelRequest(labelData);
            
            const response = await axios.post(this.baseURL, soapEnvelope, {
                headers: {
                    'Content-Type': 'text/xml; charset=utf-8',
                    'SOAPAction': 'http://ws.aramex.net/ShippingAPI/v1/Service_1_0/PrintLabel'
                },
                timeout: 30000
            });

            const result = await this.parseSoapResponse(response.data);
            return this.formatPrintLabelResponse(result);
            
        } catch (error) {
            console.error('Aramex label printing error:', error);
            throw new Error(`Failed to print label: ${error.message}`);
        }
    }

    /**
     * Build SOAP request for creating pickup
     */
    buildCreatePickupRequest(pickupData) {
        const soapBody = {
            'soap:Envelope': {
                '$': {
                    'xmlns:soap': 'http://schemas.xmlsoap.org/soap/envelope/',
                    'xmlns:ns': 'http://ws.aramex.net/ShippingAPI/v1/'
                },
                'soap:Header': {},
                'soap:Body': {
                    'ns:CreatePickup': {
                        'ns:ClientInfo': {
                            'ns:AccountCountryCode': this.credentials.AccountCountryCode,
                            'ns:AccountEntity': this.credentials.AccountEntity,
                            'ns:AccountNumber': this.credentials.AccountNumber,
                            'ns:AccountPin': this.credentials.AccountPin,
                            'ns:UserName': this.credentials.UserName,
                            'ns:Password': this.credentials.Password,
                            'ns:Version': this.credentials.Version
                        },
                        'ns:Transaction': {
                            'ns:Reference1': 'CreatePickup',
                            'ns:Reference2': new Date().toISOString(),
                            'ns:Reference3': '',
                            'ns:Reference4': '',
                            'ns:Reference5': ''
                        },
                        'ns:Pickup': {
                            'ns:PickupAddress': {
                                'ns:Line1': pickupData.address?.line1 || '',
                                'ns:Line2': pickupData.address?.line2 || '',
                                'ns:Line3': pickupData.address?.line3 || '',
                                'ns:City': pickupData.address?.city || '',
                                'ns:StateOrProvinceCode': pickupData.address?.state || '',
                                'ns:PostCode': pickupData.address?.postCode || '',
                                'ns:CountryCode': pickupData.address?.countryCode || 'SA'
                            },
                            'ns:PickupContact': {
                                'ns:Department': pickupData.contact?.department || '',
                                'ns:PersonName': pickupData.contact?.personName || '',
                                'ns:Title': pickupData.contact?.title || '',
                                'ns:CompanyName': pickupData.contact?.companyName || '',
                                'ns:PhoneNumber1': pickupData.contact?.phoneNumber1 || '',
                                'ns:PhoneNumber1Ext': pickupData.contact?.phoneNumber1Ext || '',
                                'ns:PhoneNumber2': pickupData.contact?.phoneNumber2 || '',
                                'ns:PhoneNumber2Ext': pickupData.contact?.phoneNumber2Ext || '',
                                'ns:FaxNumber': pickupData.contact?.faxNumber || '',
                                'ns:CellPhone': pickupData.contact?.cellPhone || '',
                                'ns:EmailAddress': pickupData.contact?.emailAddress || '',
                                'ns:Type': pickupData.contact?.type || ''
                            },
                            'ns:PickupDate': pickupData.pickupDate || new Date().toISOString(),
                            'ns:ReadyTime': pickupData.readyTime || '10:00',
                            'ns:LastPickupTime': pickupData.lastPickupTime || '17:00',
                            'ns:ClosingTime': pickupData.closingTime || '17:00',
                            'ns:Comments': pickupData.comments || '',
                            'ns:Reference1': pickupData.reference1 || '',
                            'ns:Reference2': pickupData.reference2 || '',
                            'ns:Vehicle': pickupData.vehicle || '',
                            'ns:Status': pickupData.status || 'Ready'
                        }
                    }
                }
            }
        };

        return this.xmlBuilder.buildObject(soapBody);
    }

    /**
     * Build SOAP request for canceling pickup
     */
    buildCancelPickupRequest(pickupData) {
        const soapBody = {
            'soap:Envelope': {
                '$': {
                    'xmlns:soap': 'http://schemas.xmlsoap.org/soap/envelope/',
                    'xmlns:ns': 'http://ws.aramex.net/ShippingAPI/v1/'
                },
                'soap:Header': {},
                'soap:Body': {
                    'ns:CancelPickup': {
                        'ns:ClientInfo': {
                            'ns:AccountCountryCode': this.credentials.AccountCountryCode,
                            'ns:AccountEntity': this.credentials.AccountEntity,
                            'ns:AccountNumber': this.credentials.AccountNumber,
                            'ns:AccountPin': this.credentials.AccountPin,
                            'ns:UserName': this.credentials.UserName,
                            'ns:Password': this.credentials.Password,
                            'ns:Version': this.credentials.Version
                        },
                        'ns:Transaction': {
                            'ns:Reference1': 'CancelPickup',
                            'ns:Reference2': new Date().toISOString(),
                            'ns:Reference3': '',
                            'ns:Reference4': '',
                            'ns:Reference5': ''
                        },
                        'ns:PickupGUID': pickupData.pickupGUID || '',
                        'ns:Comments': pickupData.comments || ''
                    }
                }
            }
        };

        return this.xmlBuilder.buildObject(soapBody);
    }

    /**
     * Build SOAP request for printing label
     */
    buildPrintLabelRequest(labelData) {
        const soapBody = {
            'soap:Envelope': {
                '$': {
                    'xmlns:soap': 'http://schemas.xmlsoap.org/soap/envelope/',
                    'xmlns:ns': 'http://ws.aramex.net/ShippingAPI/v1/'
                },
                'soap:Header': {},
                'soap:Body': {
                    'ns:PrintLabel': {
                        'ns:ClientInfo': {
                            'ns:AccountCountryCode': this.credentials.AccountCountryCode,
                            'ns:AccountEntity': this.credentials.AccountEntity,
                            'ns:AccountNumber': this.credentials.AccountNumber,
                            'ns:AccountPin': this.credentials.AccountPin,
                            'ns:UserName': this.credentials.UserName,
                            'ns:Password': this.credentials.Password,
                            'ns:Version': this.credentials.Version
                        },
                        'ns:Transaction': {
                            'ns:Reference1': 'PrintLabel',
                            'ns:Reference2': new Date().toISOString(),
                            'ns:Reference3': '',
                            'ns:Reference4': '',
                            'ns:Reference5': ''
                        },
                        'ns:LabelInfo': {
                            'ns:ReportID': labelData.reportID || 9201,
                            'ns:ReportType': labelData.reportType || 'URL'
                        },
                        'ns:OriginEntity': labelData.originEntity || this.credentials.AccountEntity,
                        'ns:ProductGroup': labelData.productGroup || 'DOM',
                        'ns:ProductType': labelData.productType || 'ONX',
                        'ns:WaybillNumber': labelData.waybillNumber || ''
                    }
                }
            }
        };

        return this.xmlBuilder.buildObject(soapBody);
    }

    /**
     * Format pickup response
     */
    formatPickupResponse(soapResult) {
        try {
            const envelope = soapResult['soap:Envelope'] || soapResult['soap:envelope'];
            const body = envelope['soap:Body'] || envelope['soap:body'];
            const pickupResponse = body['ns:CreatePickupResponse'] || body['ns:createPickupResponse'];
            
            if (!pickupResponse) {
                throw new Error('Invalid SOAP response structure');
            }

            return {
                success: true,
                pickup: {
                    guid: pickupResponse['ns:PickupGUID'] || pickupResponse['ns:pickupGUID'],
                    reference: pickupResponse['ns:Reference'] || pickupResponse['ns:reference'],
                    status: pickupResponse['ns:Status'] || pickupResponse['ns:status']
                }
            };
        } catch (error) {
            console.error('Error formatting pickup response:', error);
            return {
                success: false,
                error: 'Failed to format pickup response',
                details: error.message
            };
        }
    }

    /**
     * Format cancel pickup response
     */
    formatCancelPickupResponse(soapResult) {
        try {
            const envelope = soapResult['soap:Envelope'] || soapResult['soap:envelope'];
            const body = envelope['soap:Body'] || envelope['soap:body'];
            const cancelResponse = body['ns:CancelPickupResponse'] || body['ns:cancelPickupResponse'];
            
            if (!cancelResponse) {
                throw new Error('Invalid SOAP response structure');
            }

            return {
                success: true,
                message: 'Pickup cancelled successfully'
            };
        } catch (error) {
            console.error('Error formatting cancel pickup response:', error);
            return {
                success: false,
                error: 'Failed to format cancel pickup response',
                details: error.message
            };
        }
    }

    /**
     * Format print label response
     */
    formatPrintLabelResponse(soapResult) {
        try {
            const envelope = soapResult['soap:Envelope'] || soapResult['soap:envelope'];
            const body = envelope['soap:Body'] || envelope['soap:body'];
            const labelResponse = body['ns:PrintLabelResponse'] || body['ns:printLabelResponse'];
            
            if (!labelResponse) {
                throw new Error('Invalid SOAP response structure');
            }

            return {
                success: true,
                label: {
                    url: labelResponse['ns:LabelURL'] || labelResponse['ns:labelURL'],
                    content: labelResponse['ns:LabelContent'] || labelResponse['ns:labelContent']
                }
            };
        } catch (error) {
            console.error('Error formatting print label response:', error);
            return {
                success: false,
                error: 'Failed to format print label response',
                details: error.message
            };
        }
    }
}

module.exports = new AramexService();
