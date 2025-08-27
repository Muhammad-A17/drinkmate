export type Language = 'EN' | 'AR';

export interface Translations {
  // Header & Navigation
  header: {
    shop: string
    co2: string
    recipes: string
    contactUs: string
    trackOrder: string
    refillCylinder: string
    refill: string
  }
  
  // Banner
  banner: {
    messages: {
      freeDelivery: string
      colaFlavors: string
      firstOrderDiscount: string
      megaOffer: string
      cylinderRefill: string
    }
    codes: {
      cola44: string
      new25: string
    }
  }
  
  // Homepage
  home: {
    hero: {
      title: string
      subtitle: string
      description: string
      exploreMore: string
      buyNow: string
    }
    refill: {
      title: string
      description: string
      buttonText: string
      offerText: string
      carbonatesUpto: string
      liters: string
      litersOfDrink: string
      slide2: {
        headline: string
        description: string
        buttonText?: string
      }
      slide3: {
        headline: string
        description: string
        buttonText: string
      }
    }
    features: {
      title: string
      subtitle: string
      feature1: {
        title: string
        description: string
      }
      feature2: {
        title: string
        description: string
      }
      feature3: {
        title: string
        description: string
      }
    }
    products: {
      title: string
      subtitle: string
      viewAll: string
    }
    testimonials: {
      title: string
      subtitle: string
      testimonial1: {
        text: string
        author: string
        role: string
      }
      testimonial2: {
        text: string
        author: string
        role: string
      }
      testimonial3: {
        text: string
        author: string
        role: string
      }
    },
    carousel: {
      slide1: {
        headline: string
        description: string
        buttonText: string
        offerText: string
        carbonatesUpto: string
        liters: string
        litersOfDrink: string
      }
      slide2: {
        headline: string
        description: string
        buttonText: string
      }
      slide3: {
        headline: string
        description: string
        buttonText: string
      }
    },
    productCategories: {
      sodaMakers: string
      co2: string
      premiumItalianFlavors: string
      accessories: string
    },
    megaOffer: {
      title: string
      description: string
      availableColors: string
      offersBundles: string
      exploreMore: string
    },
    howItWorks: {
      title: string
      subtitle: string
    },
    co2Section: {
      litersOfDrinks: string
      description: string
      descriptionAr: string
      learnMore: string
      learnMoreAr: string
      exploreSubscriptions: string
      exploreSubscriptionsAr: string
      benefits: {
        easyExchange: string
        easyExchangeAr: string
        sustainable: string
        sustainableAr: string
        fizzReady: string
        fizzReadyAr: string
      }
    },
    flavorSection: {
      subtitle: string
      title: string
      description: string
      exploreFlavors: string
    },
    additionalSections: {
      howToUse: {
        title: string
        description: string
      },
      recipes: {
        title: string
        description: string
      },
      premiumFlavors: {
        title: string
        description: string
      }
    },
    environmental: {
      subtitle: string
      title: string
      plasticImpact: string
      naturalFlavors: string
      healthBenefits: string
    }
  }
  
  // Shop
  shop: {
    title: string
    subtitle: string
    description: string
    hero: {
      title: string
      subtitle: string
      description: string
    }
    refill: {
      title: string
      description: string
      buttonText: string
      offerText: string
      carbonatesUpto: string
      liters: string
      litersOfDrink: string
      slide2: {
        headline: string
        description: string
        buttonText?: string
      }
      slide3: {
        headline: string
        description: string
        buttonText: string
      }
    }
    bundles: {
      title: string
      subtitle: string
      description: string
      starterKit: string
      familyPack: string
      premiumBundle: string
      starterKitDescription: string
      familyPackDescription: string
      premiumBundleDescription: string
      starterKitItems: string
      familyPackItems: string
      premiumBundleItems: string
      includes: string
      save: string
      shopNow: string
      getPopularBundle: string
      limitedTimeOffer: string
      bestSeller: string
      mostPopular: string
      limitedTimeOfferText: string
    }
    filters: {
      all: string
      machines: string
      flavors: string
      accessories: string
      showing: string
      products: string
      sortBy: string
      featured: string
      priceLowToHigh: string
      priceHighToLow: string
      highestRated: string
      newest: string
      loadMore: string
    }
    products: {
      addToCart: string
      outOfStock: string
      new: string
      popular: string
      discount: string
      verified: string
      reviews: string
      rating: string
      productNames: {
        drinkmateRed: string
        drinkmateBlue: string
        drinkmateBlack: string
        co2Cylinder: string
        strawberryLemonSyrup: string
        premiumFlavorsPack: string
        bottlesSet: string
        energyColaFlavors: string
      }
      categories: {
        sodaMakers: string
        co2: string
        italianFlavors: string
        accessories: string
      }
    }
    customerReviews: {
      title: string
      subtitle: string
      description: string
      joinCustomers: string
      experienceDifference: string
      verified: string
      reviews: {
        sarah: {
          name: string
          location: string
          review: string
          date: string
        }
        ahmed: {
          name: string
          location: string
          review: string
          date: string
        }
        fatima: {
          name: string
          location: string
          review: string
          date: string
        }
        omar: {
          name: string
          location: string
          review: string
          date: string
        }
        layla: {
          name: string
          location: string
          review: string
          date: string
        }
        youssef: {
          name: string
          location: string
          review: string
          date: string
        }
      }
    }
    promotional: {
      limitedTimeOffer: string
      saveUpTo: string
      selectedItems: string
      dontMissOut: string
      shopDeals: string
      shopNow: string
      limitedTimeOfferText: string
    }
    productDetail: {
      breadcrumb: {
        shop: string
        category: string
        product: string
      }
      badges: {
        new: string
        popular: string
        discount: string
        lowStock: string
      }
      imageCounter: {
        of: string
      }
      rating: {
        outOf5: string
        reviews: string
        verifiedPurchase: string
        basedOn: string
        verifiedReviews: string
        helpful: string
        reply: string
      }
      options: {
        availableColors: string
        availableSizes: string
        quantity: string
      }
      actions: {
        addToCart: string
        outOfStock: string
        addToWishlist: string
        addBundleToCart: string
        addedToCart: string
        removeFromWishlist: string
      }
      features: {
        keyFeatures: string
        bundleBenefits: string
        whatsIncluded: string
      }
      trust: {
        freeShipping: string
        warranty: string
        easyReturns: string
        twoYearWarranty: string
      }
      tabs: {
        productInformation: string
        completeDetails: string
        productDescription: string
        technicalSpecifications: string
        customerReviews: string
        bundleSpecifications: string
        outOf5: string
        basedOn: string
        verified: string
      }
      related: {
        youMightAlsoLike: string
        products: {
          drinkmateRed: string
          co2Cylinder: string
          strawberryLemon: string
        }
        categories: {
          sodaMakers: string
          co2: string
          italianFlavors: string
        }
      }
      products: {
        names: {
          drinkmateRed: string
          drinkmateBlue: string
          drinkmateBlack: string
          co2Cylinder: string
          strawberryLemonSyrup: string
          premiumFlavorsPack: string
          bottlesSet: string
          energyColaFlavors: string
        }
        categories: {
          sodaMakers: string
          co2: string
          italianFlavors: string
          accessories: string
        }
        descriptions: {
          drinkmateRed: string
          drinkmateBlue: string
          drinkmateBlack: string
          co2Cylinder: string
          strawberryLemonSyrup: string
          premiumFlavorsPack: string
          bottlesSet: string
          energyColaFlavors: string
        }
        specifications: {
          dimensions: string
          weight: string
          material: string
          powerSource: string
          capacity: string
          co2Compatibility: string
          warranty: string
          countryOfOrigin: string
          volume: string
          ingredients: string
          origin: string
          allergens: string
          shelfLife: string
          storage: string
          serving: string
          certification: string
          contents: string
          totalVolume: string
          sealType: string
          dishwasherSafe: string
          bpaFree: string
          safety: string
          compatibility: string
          refillable: string
        }
        specificationValues: {
          dimensions: string
          weight: string
          material: string
          powerSource: string
          capacity: string
          co2Compatibility: string
          warranty: string
          countryOfOrigin: string
          volume: string
          ingredients: string
          origin: string
          allergens: string
          shelfLife: string
          storage: string
          serving: string
          certification: string
          contents: string
          totalVolume: string
          sealType: string
          dishwasherSafe: string
          bpaFree: string
          safety: string
          compatibility: string
          refillable: string
        }
        features: {
          carbonatesAnyLiquid: string
          advancedPressureRelease: string
          ergonomicDesign: string
          foodGradeMaterials: string
          compatibleWithCo2: string
          easyToClean: string
          portableLightweight: string
          noElectricityRequired: string
          highGradeSteel: string
          builtInSafetyValve: string
          refillableExchange: string
          longLastingPerformance: string
          authenticItalianRecipe: string
          naturalIngredients: string
          perfectBalance: string
          makesDrinks: string
          halalCertified: string
          longShelfLife: string
          noArtificialPreservatives: string
          versatileDrinks: string
          premiumCollection: string
          varietyFlavors: string
          restaurantQuality: string
          greatValuePack: string
          completeSet: string
          secureSeal: string
          perfectStorage: string
          classicCola: string
          naturalEnergy: string
          refreshingTaste: string
        }
        colors: {
          red: string
          blue: string
          black: string
          silver: string
          clear: string
          brown: string
          mixed: string
        }
        sizes: {
          standard: string
          sixtyLiters: string
          fiveHundredMl: string
          oneLiterX4: string
          eightX500ml: string
        }
        currency: {
          sar: string
          save: string
        }
        reviews: {
          sarahAlMansouri: string
          ahmedHassan: string
          fatimaZahra: string
          riyadhSaudiArabia: string
          jeddahSaudiArabia: string
          dammamSaudiArabia: string
          twoWeeksAgo: string
          oneMonthAgo: string
          threeWeeksAgo: string
          sarahReview: string
          ahmedReview: string
          fatimaReview: string
        }
      }
      bundleDetail: {
        whatsIncluded: string
        quantity: string
        addBundleToCart: string
        addToWishlist: string
        bundleBenefits: string
        bundleSpecifications: string
        save: string
        bundles: string
        mostPopular: string
        addedToCart: string
        removeFromWishlist: string
        addedToWishlist: string
        familyBundle: {
          title: string
          description: string
          items: string
          features: string[]
          specifications: Record<string, string>
        }
        starterBundle: {
          title: string
          description: string
          items: string
          features: string[]
          specifications: Record<string, string>
        }
        premiumBundle: {
          title: string
          description: string
          items: string
          features: string[]
          specifications: Record<string, string>
        }
        features: {
          completeSetup: string
          multipleCylinders: string
          varietyFlavors: string
          familyGatherings: string
          greatValue: string
          easyUse: string
        }
        specifications: {
          sodaMaker: string
          co2Cylinders: string
          flavorsIncluded: string
          totalValue: string
          bundleSavings: string
          warranty: string
          // Starter bundle specific values
          starterSodaMaker: string
          starterCo2Cylinders: string
          starterFlavors: string
          starterTotalValue: string
          starterBundleSavings: string
          starterWarranty: string
          // Family bundle specific values
          familySodaMaker: string
          familyCo2Cylinders: string
          familyFlavors: string
          familyTotalValue: string
          familyBundleSavings: string
          familyWarranty: string
          // Premium bundle specific values
          premiumSodaMaker: string
          premiumCo2Cylinders: string
          premiumFlavors: string
          premiumTotalValue: string
          premiumBundleSavings: string
          premiumWarranty: string
        }
      }
    }
  }
  
  // CO2
  co2: {
    hero: {
      title: string
      subtitle: string
      description: string
      orderCO2: string
      learnMore: string
      drinksLabel: string
      liters: string
    }
    productOptions: {
      title: string
      subtitle: string
      singleCylinder: {
        title: string
        description: string
        capacity: string
        price: string
        lifespan: string
        orderNow: string
      }
      exchangeProgram: {
        title: string
        description: string
        exchangeFee: string
        convenience: string
        ecoFriendly: string
        exchangeNow: string
      }
      bulkOrders: {
        title: string
        description: string
        minQuantity: string
        discount: string
        delivery: string
        getQuote: string
      }
    }
    refillServices: {
      title: string
      subtitle: string
      safetyFirst: {
        title: string
        description: string
        foodGradeCertification: string
        regularSafetyInspections: string
        properHandlingProcedures: string
        emergencyProtocols: string
      }
      convenientDelivery: {
        title: string
        description: string
        sameDayDelivery: string
        flexibleScheduling: string
        professionalHandling: string
        realTimeTracking: string
      }
    }
    exchangeProgram: {
      title: string
      subtitle: string
      howItWorks: string
      step1: {
        title: string
        description: string
      }
      step2: {
        title: string
        description: string
      }
      step3: {
        title: string
        description: string
      }
      saveMoney: string
      ecoFriendly: string
    }
    safetyHandling: {
      title: string
      subtitle: string
      safetyGuidelines: {
        title: string
        guideline1: string
        guideline2: string
        guideline3: string
        guideline4: string
      }
      properUsage: {
        title: string
        usage1: string
        usage2: string
        usage3: string
        usage4: string
      }
    }
    environmentalImpact: {
      title: string
      subtitle: string
      reducedWaste: {
        title: string
        description: string
      }
      circularEconomy: {
        title: string
        description: string
      }
      safeDisposal: {
        title: string
        description: string
      }
    }
    businessSolutions: {
      title: string
      subtitle: string
      restaurantsCafes: {
        title: string
        description: string
        feature1: string
        feature2: string
        feature3: string
        feature4: string
        getBusinessQuote: string
      }
      eventsCatering: {
        title: string
        description: string
        feature1: string
        feature2: string
        feature3: string
        feature4: string
        eventPlanning: string
      }
    }
  }
  
  // Contact
  contact: {
    title: string
    subtitle: string
    description: string
    phoneSupport: {
      title: string
      description: string
      hours: string
    }
    emailSupport: {
      title: string
      description: string
      response: string
    }
    officeLocation: {
      title: string
      description: string
      appointment: string
    }
    form: {
      title: string
      subtitle: string
      fullName: string
      email: string
      subject: string
      message: string
      sendMessage: string
      subjects: {
        general: string
        product: string
        support: string
        order: string
        refund: string
        other: string
      }
      placeholders: {
        fullName: string
        email: string
        subject: string
        message: string
      }
    }
    faq: {
      title: string
      subtitle: string
      questions: {
        q1: string
        a1: string
        q2: string
        a2: string
        q3: string
        a3: string
        q4: string
        a4: string
        q5: string
        a5: string
        q6: string
        a6: string
      }
    }
    liveChat: {
      title: string
      description: string
      startChat: string
    }
    offices: {
      title: string
      subtitle: string
      riyadh: {
        title: string
        address: string
        hours: string
        phone: string
      }
      jeddah: {
        title: string
        address: string
        hours: string
        phone: string
      }
    }
    testimonials: {
      title: string
      subtitle: string
      testimonial1: {
        text: string
        author: string
        role: string
      }
      testimonial2: {
        text: string
        author: string
        role: string
      }
      testimonial3: {
        text: string
        author: string
        role: string
      }
    }
  }
  
  // Track Order
  trackOrder: {
    hero: {
      title: string
      subtitle: string
    }
    form: {
      title: string
      subtitle: string
      orderNumber: string
      orderNumberPlaceholder: string
      email: string
      emailPlaceholder: string
      trackOrder: string
    }
    results: {
      title: string
      orderNumber: string
      currentStatus: string
      estimatedDelivery: string
      currentLocation: string
      trackingHistory: string
    }
    recentOrders: {
      title: string
      subtitle: string
      orderDate: string
      items: string
      total: string
      trackThisOrder: string
    }
    orderHistory: {
      title: string
      subtitle: string
      allOrders: string
      viewAllOrders: string
      orderId: string
      date: string
      status: string
      total: string
      actions: string
      track: string
    }
    delivery: {
      title: string
      subtitle: string
      standardDelivery: string
      standardDeliveryTime: string
      standardDeliveryNote: string
      expressDelivery: string
      expressDeliveryTime: string
      expressDeliveryNote: string
      localPickup: string
      localPickupTime: string
      localPickupNote: string
    }
    returns: {
      title: string
      subtitle: string
      returnPolicy: string
      returnPolicyItems: {
        item1: string
        item2: string
        item3: string
        item4: string
      }
      exchangePolicy: string
      exchangePolicyItems: {
        item1: string
        item2: string
        item3: string
        item4: string
      }
    }
    notifications: {
      title: string
      subtitle: string
      deliveryNotifications: string
      description: string
      items: {
        item1: string
        item2: string
        item3: string
        item4: string
      }
      enableNotifications: string
      learnMore: string
      getNotified: string
    }
    status: {
      orderPlaced: string
      processing: string
      shipped: string
      inTransit: string
      delivered: string
    }
    help: {
      title: string
      subtitle: string
      callUs: string
      callUsNumber: string
      callUsNote: string
      emailUs: string
      emailUsAddress: string
      emailUsNote: string
    }
  }
  
  // Blog & News
  blog: {
    hero: {
      title: string
      subtitle: string
      description: string
    }
    featuredPost: {
      title: string
      readMore: string
      publishedOn: string
      author: string
      category: string
    }
    categories: {
      all: string
      news: string
      tips: string
      recipes: string
      company: string
      science: string
      guide: string
      products: string
      environment: string
      health: string
      lifestyle: string
    }
    search: {
      placeholder: string
      searchButton: string
    }
    newsletter: {
      title: string
      description: string
      emailPlaceholder: string
      subscribe: string
    }
    pagination: {
      previous: string
      next: string
      page: string
      of: string
    }
    blogPosts: {
      readTime: string
      publishedOn: string
      author: string
      category: string
      backToBlog: string
      shareThisPost: string
      relatedPosts: string
      tags: string
      comments: string
      leaveComment: string
      commentPlaceholder: string
      postComment: string
      likePost: string
      likedPost: string
      // Blog post content translations
      postTitles: {
        post1: string
        post2: string
        post3: string
        post4: string
        post5: string
        post6: string
        post7: string
      }
      postExcerpts: {
        post1: string
        post2: string
        post3: string
        post4: string
        post5: string
        post6: string
        post7: string
      }
      postAuthors: {
        drinkmateTeam: string
        ahmedHassan: string
        sarahJohnson: string
        environmentalTeam: string
      }
      postDates: {
        jan15: string
        jan12: string
        jan10: string
        jan8: string
        jan5: string
        jan3: string
        dec30: string
      }
      post1: {
        title: string
        subtitle: string
        intro: string
        whyMake: {
          title: string
          health: {
            title: string
            benefit1: string
            benefit2: string
            benefit3: string
            benefit4: string
          }
          cost: {
            title: string
            saving1: string
            saving2: string
            saving3: string
            saving4: string
          }
        }
        excerpt: string
        author: string
        date: string
        tags: {
          recipes: string
          summer: string
          refreshing: string
          healthy: string
          sparkling: string
        }
      }
      post2: {
        title: string
        content: string
        excerpt: string
        author: string
        date: string
        tags: {
          science: string
          chemistry: string
          carbonation: string
          technology: string
        }
      }
      post3: {
        title: string
        content: string
        excerpt: string
        author: string
        date: string
        tags: {
          guide: string
          co2: string
          equipment: string
          tips: string
        }
      }
      post4: {
        title: string
        content: string
        excerpt: string
        author: string
        date: string
        tags: {
          products: string
          italian: string
          syrups: string
          premium: string
        }
      }
      post5: {
        title: string
        content: string
        excerpt: string
        author: string
        date: string
        tags: {
          environment: string
          plastic: string
          sustainability: string
          green: string
        }
      }
      post6: {
        title: string
        content: string
        excerpt: string
        author: string
        date: string
        tags: {
          health: string
          benefits: string
          myths: string
          science: string
        }
      }
      post7: {
        title: string
        content: string
        excerpt: string
        author: string
        date: string
        tags: {
          party: string
          entertainment: string
          social: string
          lifestyle: string
          carbonation: string
        }
      }
      authorBio: {
        team: string
        expert: string
      }
    }

  }
  
  // Privacy Policy
  privacyPolicy: {
    hero: {
      title: string
      subtitle: string
      lastUpdated: string
    }
    sections: {
      informationWeCollect: {
        title: string
        description: string
        personalInfo: string
        usageData: string
        cookies: string
      }
      howWeUseInformation: {
        title: string
        description: string
        purposes: string[]
      }
      informationSharing: {
        title: string
        description: string
        exceptions: string[]
      }
      dataSecurity: {
        title: string
        description: string
        measures: string[]
      }
      yourRights: {
        title: string
        description: string
        rights: string[]
      }
              contactUs: {
          title: string
          description: string
          email: string
          phone: string
        }
        personalInfoDetails: {
          nameContact: string
          paymentBilling: string
          orderHistory: string
          customerService: string
        }
        usageDataDetails: {
          ipDevice: string
          websiteUsage: string
          browserOS: string
        }
        cookiesDetails: {
          trackingTech: string
          sessionData: string
          thirdPartyAnalytics: string
        }
        purposesDetails: {
          processOrders: string
          customerSupport: string
          updatesMarketing: string
          improveServices: string
          securityFraud: string
        }
        exceptionsDetails: {
          explicitConsent: string
          legalObligations: string
          protectRights: string
          trustedProviders: string
        }
        securityDetails: {
          encryption: string
          securityAssessments: string
          accessControls: string
          secureTransmission: string
        }
        rightsDetails: {
          accessData: string
          correctInfo: string
          deleteData: string
          optOutMarketing: string
          dataPortability: string
        }
        address: string
    }
  }
  
  // Terms of Service
  termsOfService: {
    hero: {
      title: string
      subtitle: string
      lastUpdated: string
    }
    sections: {
      acceptance: {
        title: string
        description: string
      }
      services: {
        title: string
        description: string
        included: string[]
      }
      userObligations: {
        title: string
        description: string
        obligations: string[]
      }
      payment: {
        title: string
        description: string
        terms: string[]
      }
      shipping: {
        title: string
        description: string
        policies: string[]
      }
      returns: {
        title: string
        description: string
        policy: string[]
      }
      warranty: {
        title: string
        description: string
        coverage: string[]
      }
      liability: {
        title: string
        description: string
        limitations: string[]
      }
      termination: {
        title: string
        description: string
        conditions: string[]
      }
              contact: {
          title: string
          description: string
          email: string
          phone: string
        }
        servicesDetails: {
          productSales: string
          co2Services: string
          customerSupport: string
          onlineOrdering: string
        }
        obligationsDetails: {
          accurateInfo: string
          safeUsage: string
          intellectualProperty: string
          accountSecurity: string
        }
        paymentDetails: {
          sarPrices: string
          paymentMethods: string
          orderProcessing: string
          refundTiming: string
        }
        shippingDetails: {
          freeShipping: string
          standardDelivery: string
          expressDelivery: string
          localPickup: string
        }
        returnsDetails: {
          originalCondition: string
          freeReturn: string
          fullRefund: string
          co2NotEligible: string
        }
        warrantyDetails: {
          sodaMakerWarranty: string
          accessoriesWarranty: string
          manufacturingDefects: string
          normalWear: string
        }
        liabilityDetails: {
          maxLiability: string
          noIndirectDamages: string
          noMisuseLiability: string
          forceMajeure: string
        }
        terminationDetails: {
          termsViolation: string
          fraudulentActivities: string
          nonPayment: string
          serviceAbuse: string
        }
        address: string
    }
  }
  
  // Cookie Policy
  cookiePolicy: {
    hero: {
      title: string
      subtitle: string
      lastUpdated: string
    }
    sections: {
      whatAreCookies: {
        title: string
        description: string
      }
      howWeUseCookies: {
        title: string
        description: string
        purposes: string[]
      }
      typesOfCookies: {
        title: string
        essential: string
        analytics: string
        marketing: string
        preferences: string
      }
      managingCookies: {
        title: string
        description: string
        browser: string
        settings: string
      }
      thirdPartyCookies: {
        title: string
        description: string
        services: string[]
      }
      updates: {
        title: string
        description: string
      }
              contact: {
          title: string
          description: string
          email: string
        }
        purposesDetails: {
          rememberPreferences: string
          analyzeTraffic: string
          personalizedContent: string
          improveFunctionality: string
          ensureSecurity: string
        }
        thirdPartyServices: {
          googleAnalytics: string
          facebookPixel: string
          paymentProcessors: string
          socialMedia: string
        }
        address: string
    }
  }
  
  // Common
  common: {
    loading: string
    error: string
    success: string
    close: string
    next: string
    previous: string
    search: string
    filter: string
    clear: string
    apply: string
    cancel: string
    save: string
    edit: string
    delete: string
    view: string
    add: string
    remove: string
    quantity: string
    total: string
    subtotal: string
    shipping: string
    tax: string
    discount: string
    checkout: string
    continue: string
    back: string
    home: string
    about: string
    services: string
    blog: string
    privacy: string
    terms: string
    cookies: string
  }
  
  // Footer
  footer: {
    companyDescription: string
    phone: string
    email: string
    address: string
    products: {
      title: string
      sodaMakers: string
      co2Cylinders: string
      italianSyrups: string
      accessories: string
      giftBundles: string
      bulkOrders: string
    }
    information: {
      title: string
      supportHelp: string
      trackOrder: string
      drinkRecipes: string
      blogNews: string
      privacyPolicy: string
      termsOfService: string
    }
    newsletter: {
      title: string
      description: string
      emailPlaceholder: string
      subscribeButton: string
      disclaimer: string
    }
    social: {
      followUs: string
    }
    payment: {
      securePayment: string
    }
    delivery: {
      fastDelivery: string
    }
    copyright: string
    cookiePolicy: string
  }
  
  // Recipes
  recipes: {
    hero: {
      title: string
      subtitle: string
      description: string
      exploreRecipes: string
      downloadPDF: string
      recipesCountNumber: string
      recipesLabel: string
    }
    featuredRecipe: {
      recipeOfTheWeek: string
      description: string
      prepTime: string
      difficulty: string
      ingredients: string
      instructions: string
      saveRecipe: string
      share: string
    }
    categories: {
      all: string
      fruity: string
      citrus: string
      berry: string
      cola: string
    }
    recipeData: {
      italianStrawberryLemonade: {
        name: string
        category: string
        difficulty: string
        time: string
        instructions: string
      }
      cherryColaFizz: {
        name: string
        category: string
        difficulty: string
        time: string
        instructions: string
      }
      blueRaspberryBlast: {
        name: string
        category: string
        difficulty: string
        time: string
        instructions: string
      }
      limeMojitoSparkle: {
        name: string
        category: string
        difficulty: string
        time: string
        instructions: string
      }
      orangeCreamsicle: {
        name: string
        category: string
        difficulty: string
        time: string
        instructions: string
      }
      grapeSodaSupreme: {
        name: string
        category: string
        difficulty: string
        time: string
        instructions: string
      }
    }
    ingredients: {
      strawberryLemonSyrup: string
      cherryColaSyrup: string
      blueRaspberrySyrup: string
      limeSyrup: string
      orangeSyrup: string
      vanillaSyrup: string
      grapeSyrup: string
      sparklingWater: string
      freshLemon: string
      freshBlueberries: string
      mint: string
      mintLeaves: string
      sugar: string
      cream: string
      ice: string
    }
    tags: {
      refreshing: string
      summer: string
      popular: string
      classic: string
      bold: string
      fizzy: string
      berry: string
      gourmet: string
      citrus: string
      mojito: string
      fresh: string
      creamy: string
      orange: string
      dessert: string
      grape: string
      simple: string
    }
    recipeCard: {
      reviews: string
      ingredients: string
      viewRecipe: string
    }
    newsletter: {
      title: string
      description: string
      emailPlaceholder: string
      subscribe: string
    }
    difficultyLevels: {
      title: string
      subtitle: string
      beginner: {
        title: string
        description: string
        feature1: string
        feature2: string
        feature3: string
      }
      intermediate: {
        title: string
        description: string
        feature1: string
        feature2: string
        feature3: string
      }
      advanced: {
        title: string
        description: string
        feature1: string
        feature2: string
        feature3: string
      }
    }
    seasonalRecipes: {
      title: string
      subtitle: string
      spring: {
        title: string
        description: string
      }
      summer: {
        title: string
        description: string
      }
      autumn: {
        title: string
        description: string
      }
      winter: {
        title: string
        description: string
      }
    }
    communityRecipes: {
      title: string
      subtitle: string
      tropicalParadise: {
        title: string
        description: string
        by: string
        verified: string
      }
      berryBlast: {
        title: string
        description: string
        by: string
        verified: string
      }
      submitYourRecipe: string
    }
    nutritionalInfo: {
      title: string
      subtitle: string
      calorieUnit: string
      calorieContent: {
        title: string
        plainSparklingWater: string
        withNaturalSyrup: string
        premiumSyrupMix: string
      }
      healthBenefits: {
        title: string
        benefit1: string
        benefit2: string
        benefit3: string
      }
      allergenInfo: {
        title: string
        info1: string
        info2: string
        info3: string
      }
    }
  }
}

export const translations: Record<Language, Translations> = {
  EN: {
    header: {
      shop: "Shop",
      co2: "CO2",
      recipes: "Recipes",
      contactUs: "Contact Us",
      trackOrder: "Track Order",
      refillCylinder: "Refill Cylinder",
      refill: "Refill"
    },
    banner: {
      messages: {
          freeDelivery: "🚚 Free delivery on orders above 150 ﷼",
          colaFlavors: "🥤 Get 3 cola flavors just for 149 ﷼ use code COLA44",
          firstOrderDiscount: "🎉 Get 5% off on your first order with us code NEW25",
          megaOffer: "⚡ Drinkmate OmniFizz starting from 599 ﷼",
          cylinderRefill: "🔄 CO2 cylinder refill from 65 ﷼"
      },
      codes: {
        cola44: "Cola44",
        new25: "NEW25"
      }
    },
    home: {
      hero: {
        title: "Sparkling Made Simple",
        subtitle: "With Drinkmate OmniFizz",
        description: "Enjoy free Italian strawberry lime with the purchase of Arctic blue color machine.",
        exploreMore: "Explore more",
        buyNow: "Buy Now"
      },
      refill: {
        title: "REFILL MORE. SAVE MORE.",
        description: "Now refill 4 cylinders all together for the price of 55 SAR each cylinder.",
        buttonText: "Refill Now",
        offerText: "*Offer valid for whole year*",
        carbonatesUpto: "Carbonates upto",
        liters: "60",
        litersOfDrink: "Liters of drink",
        slide2: {
          headline: "GET ENERGY DRINK & COLA FLAVOR FOR 79 SAR",
          description: "Beat the summer heat with our best sellers.",
          buttonText: "Refill Now"
        },
        slide3: {
          headline: "5% OFF ON FIRST ORDER FOR OUR NEW CUSTOMERS",
          description: "Getting into sparkle game? Enjoy 5% off on your first order with drinkmate.",
          buttonText: "Shop Now"
        }
      },
      features: {
        title: "Why Choose Drinkmate",
        subtitle: "Premium quality meets innovative technology",
        feature1: {
          title: "Versatile Carbonation",
          description: "Carbonate any liquid including juice, wine, and cocktails"
        },
        feature2: {
          title: "Italian Flavors",
          description: "Authentic Italian syrups made with natural ingredients"
        },
        feature3: {
          title: "Eco-Friendly",
          description: "Reduce plastic waste with reusable bottles"
        }
      },
      products: {
        title: "Featured Products",
        subtitle: "Discover our best-selling items",
        viewAll: "View All"
      },
      testimonials: {
        title: "What Our Customers Say",
        subtitle: "Real feedback from satisfied customers",
        testimonial1: {
          text: "Excellent customer service! The team helped me choose the perfect soda maker and the support has been outstanding.",
          author: "Ahmed S.",
          role: "Verified Customer"
        },
        testimonial2: {
          text: "Quick response time and very helpful staff. They resolved my CO2 refill issue within hours.",
          author: "Sarah M.",
          role: "Verified Customer"
        },
        testimonial3: {
          text: "Professional service and great product knowledge. They really know their stuff!",
          author: "Mohammed K.",
          role: "Verified Customer"
        }
      },
      carousel: {
        slide1: {
          headline: "REFILL MORE. SAVE MORE.",
          description: "Now refill 4 cylinders all together for the price of 55 SAR each cylinder.",
          buttonText: "Refill Now",
          offerText: "*Offer valid for whole year*",
          carbonatesUpto: "Carbonates upto",
          liters: "60",
          litersOfDrink: "Liters of drink"
        },
        slide2: {
          headline: "GET ENERGY DRINK & COLA FLAVOR FOR 79 SAR",
          description: "Beat the summer heat with our best sellers.",
          buttonText: "Refill Now"
        },
        slide3: {
          headline: "5% OFF ON FIRST ORDER FOR OUR NEW CUSTOMERS",
          description: "Getting into sparkle game? Enjoy 5% off on your first order with drinkmate.",
          buttonText: "Shop Now"
        }
      },
      productCategories: {
        sodaMakers: "Soda Makers",
        co2: "CO2",
        premiumItalianFlavors: "Premium Italian Flavors",
        accessories: "Accessories"
      },
      megaOffer: {
        title: "Drinkmate OmniFizz",
        description: "Unlike traditional soda makers, the Drinkmate OmniFizz allows you to effortlessly carbonate any drink, from juice and iced tea to wine and cocktails, providing endless possibilities for sparkling refreshments.",
        availableColors: "Available Color Options",
        offersBundles: "Offers & Bundles",
        exploreMore: "Explore More"
      },
      howItWorks: {
        title: "How does the Drinkmate OmniFizz work?",
        subtitle: "Three simple steps that show you how to use the Drinkmate OmniFizz"
      },
      co2Section: {
        litersOfDrinks: "Liters of Drinks",
        description: "With Drinkmate's CO2 Exchange Program, send back empty cylinders and get a discount on your next CO2 purchase. Easy, sustainable, and fizz-ready—always.",
        descriptionAr: "مع برنامج تبادل ثاني أكسيد الكربون من Drinkmate، أرسل الأسطوانات الفارغة واحصل على خصم على مشترياتك القادمة من ثاني أكسيد الكربون. سهل ومستدام وجاهز للفوران—دائماً.",
        learnMore: "Learn More",
        learnMoreAr: "اعرف المزيد",
        exploreSubscriptions: "Explore Subscriptions",
        exploreSubscriptionsAr: "استكشف الاشتراكات",
        benefits: {
          easyExchange: "Easy cylinder exchange",
          easyExchangeAr: "تبادل سهل للأسطوانات",
          sustainable: "Sustainable & eco-friendly",
          sustainableAr: "مستدام وصديق للبيئة",
          fizzReady: "Always fizz-ready",
          fizzReadyAr: "دائماً جاهز للفوران"
        }
      },
      flavorSection: {
        subtitle: "Don't just sparkle water",
        title: "Sparkle Anything",
        description: "Discover our premium Italian flavors and create amazing sparkling drinks at home. From classic cola to exotic fruit combinations, the possibilities are endless!",
        exploreFlavors: "Explore Flavors"
      },
      additionalSections: {
        howToUse: {
          title: "How to Use",
          description: "Learn how to make perfect drinks every-time using drinkmate's premium Italian syrups."
        },
        recipes: {
          title: "Recipes",
          description: "DIY drinks custom made for you to experience and enjoy."
        },
        premiumFlavors: {
          title: "Premium Italian Flavors",
          description: "Know & try all 22 of our natural no sugar premium Italian flavors."
        }
      },
      environmental: {
        subtitle: "Know More About Drinkmate Efforts For The",
        title: "Greener & Better Environment",
        plasticImpact: "Our impact on One time plastic use",
        naturalFlavors: "How our natural flavors are made",
        healthBenefits: "Health Benefits of sparkling water"
      }
    },
    shop: {
      title: "Shop Our Products",
      subtitle: "Premium soda makers and authentic Italian flavors",
      description: "Discover our complete range of soda makers, CO2 cylinders, premium Italian syrups, and accessories. Everything you need to create perfect sparkling drinks at home.",
      hero: {
        title: "Shop Our",
        subtitle: "Products",
        description: "Discover our complete range of soda makers, CO2 cylinders, premium Italian syrups, and accessories. Everything you need to create perfect sparkling drinks at home."
      },
      refill: {
        title: "REFILL MORE. SAVE MORE.",
        description: "Now refill 4 cylinders all together for the price of 55 SAR each cylinder.",
        buttonText: "Refill Now",
        offerText: "*Offer valid for whole year*",
        carbonatesUpto: "Carbonates upto",
        liters: "60",
        litersOfDrink: "Liters of drink",
        slide2: {
          headline: "GET ENERGY DRINK & COLA FLAVOR FOR 79 SAR",
          description: "Beat the summer heat with our best sellers.",
          buttonText: "Refill Now"
        },
        slide3: {
          headline: "5% OFF ON FIRST ORDER FOR OUR NEW CUSTOMERS",
          description: "Getting into sparkle game? Enjoy 5% off on your first order with drinkmate.",
          buttonText: "Shop Now"
        }
      },
      bundles: {
        title: "Premium",
        subtitle: "Bundles",
        description: "Discover our carefully curated bundles designed to give you the ultimate Drinkmate experience. Save big while getting everything you need in one perfect package.",
        starterKit: "Starter Kit",
        familyPack: "Family Pack",
        premiumBundle: "Premium Bundle",
        starterKitDescription: "Everything you need to get started with Drinkmate.",
        familyPackDescription: "Perfect for families looking to carbonate their drinks.",
        premiumBundleDescription: "The ultimate Drinkmate experience, all in one bundle.",
        starterKitItems: "1 Drinkmate OmniFizz, 1 CO2 Cylinder, 1 Strawberry Lemon Syrup Bottle",
        familyPackItems: "2 Drinkmate OmniFizz, 2 CO2 Cylinders, 2 Premium Flavors Pack, 1 Bottles Set",
        premiumBundleItems: "3 Drinkmate OmniFizz, 3 CO2 Cylinders, 3 Premium Flavors Pack, 1 Bottles Set, 1 Energy Cola Flavors Pack",
        includes: "INCLUDES:",
        save: "Save",
        shopNow: "Shop Now",
        getPopularBundle: "🔥 Get Popular Bundle",
        limitedTimeOffer: "⚡ LIMITED TIME OFFER",
        bestSeller: "🔥 BEST SELLER",
        mostPopular: "⭐ MOST POPULAR",
        limitedTimeOfferText: "Limited Time Offer"
      },
      filters: {
        all: "All",
        machines: "Soda Makers",
        flavors: "Italian Flavors",
        accessories: "Accessories",
        showing: "Showing",
        products: "products",
        sortBy: "Sort by:",
        featured: "Featured",
        priceLowToHigh: "Price: Low to High",
        priceHighToLow: "Price: High to Low",
        highestRated: "Highest Rated",
        newest: "Newest",
        loadMore: "Load More Products"
      },
      products: {
        addToCart: "ADD TO CART",
        outOfStock: "OUT OF STOCK",
        new: "🆕 NEW",
        popular: "⭐ POPULAR",
        discount: "💥",
        verified: "Verified",
        reviews: "reviews",
        rating: "rating",
        productNames: {
          drinkmateRed: "Drinkmate - OmniFizz Machine - Red",
          drinkmateBlue: "Drinkmate - OmniFizz Machine - Blue",
          drinkmateBlack: "Drinkmate - OmniFizz Machine - Black",
          co2Cylinder: "CO2 Cylinder 60L",
          strawberryLemonSyrup: "Italian Strawberry Lemon Syrup",
          premiumFlavorsPack: "Premium Italian Flavors Pack",
          bottlesSet: "Drinkmate Bottles Set",
          energyColaFlavors: "Energy Cola Flavors"
        },
        categories: {
          sodaMakers: "Soda Makers",
          co2: "CO2",
          italianFlavors: "Italian Flavors",
          accessories: "Accessories"
        }
      },
      customerReviews: {
        title: "What Our",
        subtitle: "Customers",
        description: "Real reviews from satisfied Drinkmate users worldwide",
        joinCustomers: "Join 10,000+ Happy Customers",
        experienceDifference: "Experience the Drinkmate difference today!",
        verified: "Verified",
        reviews: {
          sarah: {
            name: "Sarah Al-Mansouri",
            location: "Riyadh, Saudi Arabia",
            review: "Absolutely love my Drinkmate OmniFizz! The Italian flavors are incredible and the machine is so easy to use. My kids love making their own sparkling drinks. Best purchase ever!",
            date: "2 weeks ago"
          },
          ahmed: {
            name: "Ahmed Hassan",
            location: "Jeddah, Saudi Arabia",
            review: "Perfect for hosting parties! Everyone is amazed by the quality of sparkling drinks we can make at home. The CO2 exchange program is very convenient and cost-effective.",
            date: "1 month ago"
          },
          fatima: {
            name: "Fatima Zahra",
            location: "Dammam, Saudi Arabia",
            review: "The premium Italian flavors are absolutely divine! I've tried all 22 flavors and each one is better than the last. The machine is durable and the customer service is exceptional.",
            date: "3 weeks ago"
          },
          omar: {
            name: "Omar Khalil",
            location: "Abha, Saudi Arabia",
            review: "Great investment for health-conscious people. We've reduced our soda consumption significantly and now enjoy natural sparkling drinks. The starter kit was perfect for beginners.",
            date: "1 month ago"
          },
          layla: {
            name: "Layla Al-Rashid",
            location: "Tabuk, Saudi Arabia",
            review: "The family pack bundle is amazing value! We use it daily and the quality never disappoints. The machine is built to last and the flavors are restaurant-quality. Highly recommend!",
            date: "2 months ago"
          },
          youssef: {
            name: "Youssef Al-Mahmoud",
            location: "Al-Khobar, Saudi Arabia",
            review: "Excellent product and service! The CO2 cylinders last longer than expected and the flavors are authentic Italian. Perfect for making mocktails and refreshing drinks at home.",
            date: "3 weeks ago"
          }
        }
      },
      promotional: {
        limitedTimeOffer: "Limited Time Offer",
        saveUpTo: "Save up to",
        selectedItems: "on selected items",
        dontMissOut: "Don't miss out on these amazing deals - shop now before they're gone!",
        shopDeals: "🚀 Shop the Deals",
        shopNow: "Shop Now",
        limitedTimeOfferText: "Limited Time Offer"
      },
      productDetail: {
        breadcrumb: {
          shop: "Shop",
          category: "Product Category",
          product: "Product Name"
        },
              badges: {
        new: "New",
        popular: "Popular",
        discount: "Discount",
        lowStock: "Low Stock"
      },
        imageCounter: {
          of: "of"
        },
        rating: {
          outOf5: "Out of 5",
          reviews: "reviews",
          verifiedPurchase: "Verified Purchase",
          basedOn: "Based on",
          verifiedReviews: "verified reviews",
          helpful: "Helpful",
          reply: "Reply"
        },
        options: {
          availableColors: "Available Colors",
          availableSizes: "Available Sizes",
          quantity: "Quantity"
        },
        actions: {
          addToCart: "Add to Cart",
          outOfStock: "Out of Stock",
          addToWishlist: "Add to Wishlist",
          addBundleToCart: "Add Bundle to Cart",
          addedToCart: "Added to Cart",
          removeFromWishlist: "Remove from Wishlist"
        },
        features: {
          keyFeatures: "Key Features",
          bundleBenefits: "Bundle Benefits",
          whatsIncluded: "What's Included"
        },
        trust: {
          freeShipping: "Free Shipping",
          warranty: "Warranty",
          easyReturns: "Easy Returns",
          twoYearWarranty: "2 Year Warranty"
        },
        tabs: {
          productInformation: "Product Information",
          completeDetails: "Complete Details",
          productDescription: "Product Description",
          technicalSpecifications: "Technical Specifications",
          customerReviews: "Customer Reviews",
          bundleSpecifications: "Bundle Specifications",
          outOf5: "out of 5",
          basedOn: "Based on",
          verified: "Verified"
        },
        related: {
          youMightAlsoLike: "You Might Also Like",
          products: {
            drinkmateRed: "Drinkmate - OmniFizz Machine - Red",
            co2Cylinder: "CO2 Cylinder 60L",
            strawberryLemon: "Italian Strawberry Lemon Syrup"
          },
          categories: {
            sodaMakers: "Soda Makers",
            co2: "CO2",
            italianFlavors: "Italian Flavors"
          }
        },
        products: {
          names: {
            drinkmateRed: "Drinkmate - OmniFizz Machine - Red",
            drinkmateBlue: "Drinkmate - OmniFizz Machine - Blue",
            drinkmateBlack: "Drinkmate - OmniFizz Machine - Black",
            co2Cylinder: "CO2 Cylinder 60L",
            strawberryLemonSyrup: "Italian Strawberry Lemon Syrup",
            premiumFlavorsPack: "Premium Italian Flavors Pack",
            bottlesSet: "Drinkmate Bottles Set",
            energyColaFlavors: "Energy Cola Flavors"
          },
          categories: {
            sodaMakers: "Soda Makers",
            co2: "CO2",
            italianFlavors: "Italian Flavors",
            accessories: "Accessories"
          },
          descriptions: {
            drinkmateRed: "The Drinkmate OmniFizz Red is a revolutionary soda maker that allows you to carbonate any liquid, not just water. From juice and iced tea to wine and cocktails, the possibilities are endless. This premium red model combines style with functionality, featuring advanced carbonation technology and a sleek design that complements any kitchen.",
            drinkmateBlue: "The Drinkmate OmniFizz Blue offers the same revolutionary carbonation technology in a stunning blue finish. Perfect for those who prefer a cooler, more modern aesthetic while enjoying all the benefits of professional-grade soda making at home.",
            drinkmateBlack: "The Drinkmate OmniFizz Black combines elegance with functionality. This sleek black model offers the same advanced carbonation technology in a sophisticated design that fits perfectly in any modern kitchen.",
            co2Cylinder: "High-quality CO2 cylinder that provides up to 60 liters of carbonated drinks. Compatible with all Drinkmate machines and designed for safe, reliable operation. Perfect for home use and small gatherings.",
            strawberryLemonSyrup: "Authentic Italian strawberry lemon syrup made with premium ingredients. This delightful blend creates a refreshing, fruity sparkling drink that's perfect for any occasion. Made in Italy using traditional recipes.",
            premiumFlavorsPack: "A premium collection of authentic Italian syrups featuring the finest flavors from Italy. This pack includes a variety of classic and exotic flavors, perfect for creating restaurant-quality sparkling drinks at home.",
            bottlesSet: "Complete set of high-quality bottles designed specifically for Drinkmate machines. These bottles are made from food-grade materials and feature a secure seal to maintain carbonation. Perfect for storing and serving your homemade sparkling drinks.",
            energyColaFlavors: "Energizing cola flavor with a unique twist. This Italian-inspired energy cola syrup combines the classic cola taste with natural energy-boosting ingredients, creating a refreshing and invigorating sparkling drink."
          },
          specifications: {
            dimensions: "Dimensions",
            weight: "Weight",
            material: "Material",
            powerSource: "Power Source",
            capacity: "Capacity",
            co2Compatibility: "CO2 Compatibility",
            warranty: "Warranty",
            countryOfOrigin: "Country of Origin",
            volume: "Volume",
            ingredients: "Ingredients",
            origin: "Origin",
            allergens: "Allergens",
            shelfLife: "Shelf Life",
            storage: "Storage",
            serving: "Serving",
            certification: "Certification",
            contents: "Contents",
            totalVolume: "Total Volume",
            sealType: "Seal Type",
            dishwasherSafe: "Dishwasher Safe",
            bpaFree: "BPA Free",
            safety: "Safety",
            compatibility: "Compatibility",
            refillable: "Refillable"
          },
          specificationValues: {
            dimensions: "12.5\" x 8.5\" x 15.5\"",
            weight: "4.2 lbs",
            material: "Food-grade plastic and stainless steel",
            powerSource: "Manual operation",
            capacity: "1 liter bottles",
            co2Compatibility: "Standard 60L cylinders",
            warranty: "2 years limited warranty",
            countryOfOrigin: "Italy",
            volume: "500ml",
            ingredients: "Natural strawberry, lemon, sugar, water",
            origin: "Italy",
            allergens: "None",
            shelfLife: "24 months unopened",
            storage: "Store in cool, dry place",
            serving: "Makes 10-15 drinks",
            certification: "Halal certified",
            contents: "4 bottles with caps",
            totalVolume: "4 liters",
            sealType: "Screw-top with gasket",
            dishwasherSafe: "Yes",
            bpaFree: "Yes",
            safety: "Built-in safety valve",
            compatibility: "All Drinkmate machines",
            refillable: "Yes, through exchange program"
          },
          features: {
            carbonatesAnyLiquid: "Carbonates any liquid in seconds",
            advancedPressureRelease: "Advanced pressure release system",
            ergonomicDesign: "Ergonomic design for easy operation",
            foodGradeMaterials: "Food-grade materials for safety",
            compatibleWithCo2: "Compatible with all standard CO2 cylinders",
            easyToClean: "Easy-to-clean components",
            portableLightweight: "Portable and lightweight",
            noElectricityRequired: "No electricity required",
            highGradeSteel: "High-grade steel construction",
            builtInSafetyValve: "Built-in safety valve",
            refillableExchange: "Refillable through exchange program",
            longLastingPerformance: "Long-lasting performance",
            authenticItalianRecipe: "Authentic Italian recipe",
            naturalIngredients: "Natural ingredients",
            perfectBalance: "Perfect strawberry-lemon balance",
            makesDrinks: "Makes 10-15 refreshing drinks",
            halalCertified: "Halal certified",
            longShelfLife: "Long shelf life",
            noArtificialPreservatives: "No artificial preservatives",
            versatileDrinks: "Versatile for various drinks",
            premiumCollection: "8 premium Italian syrups",
            varietyFlavors: "Variety of classic flavors",
            restaurantQuality: "Restaurant-quality taste",
            greatValuePack: "Great value pack",
            completeSet: "4 bottles with secure caps",
            secureSeal: "Secure seal maintains carbonation",
            perfectStorage: "Perfect for storage and serving",
            classicCola: "Classic cola taste",
            naturalEnergy: "Natural energy boost",
            refreshingTaste: "Refreshing taste"
          },
          colors: {
            red: "Red",
            blue: "Blue",
            black: "Black",
            silver: "Silver",
            clear: "Clear",
            brown: "Brown",
            mixed: "Mixed"
          },
          sizes: {
            standard: "Standard",
            sixtyLiters: "60L",
            fiveHundredMl: "500ml",
            oneLiterX4: "1L x4",
            eightX500ml: "8x500ml"
          },
          currency: {
            sar: "SAR",
            save: "Save"
          },
          reviews: {
            sarahAlMansouri: "Sarah Al-Mansouri",
            ahmedHassan: "Ahmed Hassan",
            fatimaZahra: "Fatima Zahra",
            riyadhSaudiArabia: "Riyadh, Saudi Arabia",
            jeddahSaudiArabia: "Jeddah, Saudi Arabia",
            dammamSaudiArabia: "Dammam, Saudi Arabia",
            twoWeeksAgo: "2 weeks ago",
            oneMonthAgo: "1 month ago",
            threeWeeksAgo: "3 weeks ago",
            sarahReview: "Absolutely love my Drinkmate OmniFizz! The Italian flavors are incredible and the machine is so easy to use. My kids love making their own sparkling drinks. Best purchase ever!",
            ahmedReview: "Perfect for hosting parties! Everyone is amazed by the quality of sparkling drinks we can make at home. The CO2 exchange program is very convenient and cost-effective.",
            fatimaReview: "Great machine overall! The red color is beautiful and it works perfectly. Only giving 4 stars because the instruction manual could be clearer for first-time users."
          }
        },
        bundleDetail: {
          whatsIncluded: "What's Included",
          quantity: "Quantity",
          addBundleToCart: "Add Bundle to Cart",
          addToWishlist: "Add to Wishlist",
          bundleBenefits: "Bundle Benefits",
          bundleSpecifications: "Bundle Specifications",
          save: "Save",
          bundles: "Bundles",
          mostPopular: "MOST POPULAR",
          addedToCart: "Added to Cart",
          removeFromWishlist: "Remove from Wishlist",
          addedToWishlist: "Added to Wishlist",
          familyBundle: {
            title: "Complete setup for the whole family with multiple flavors",
            description: "Perfect family bundle with everything you need to start making sparkling drinks at home",
            items: "x1 Soda Maker, x2 Cylinders & x5 Flavors",
            features: [
              "Complete soda maker setup",
              "Multiple CO2 cylinders for extended use",
              "Variety of premium Italian flavors",
              "Perfect for family gatherings",
              "Great value for money",
              "Easy to use and maintain"
            ],
            specifications: {
              "Soda Maker": "Drinkmate OmniFizz (Blue)",
              "CO2 Cylinders": "2x 60L cylinders",
              "Flavors Included": "5 premium Italian syrups",
              "Total Value": "SAR 1,199.00",
              "Bundle Savings": "SAR 200.00",
              "Warranty": "2 years on machine, 1 year on accessories"
            }
          },
          starterBundle: {
            title: "Starter Kit",
            description: "Perfect Kit for those who are using the machine for the first time",
            items: "x1 Soda Maker, x1 Cylinder & x2 Flavors",
            features: [
              "Complete starter setup",
              "Perfect for beginners",
              "2 premium Italian flavors included",
              "Easy to use and maintain",
              "Great value for money",
              "Everything you need to start"
            ],
            specifications: {
              "Soda Maker": "Drinkmate OmniFizz (Hero)",
              "CO2 Cylinders": "1x 60L cylinder",
              "Flavors Included": "2 premium Italian syrups",
              "Total Value": "SAR 899.00",
              "Bundle Savings": "SAR 100.00",
              "Warranty": "2 years on machine, 1 year on accessories"
            }
          },
          premiumBundle: {
            title: "Premium Bundle",
            description: "Luxury experience with premium Italian flavors",
            items: "x1 Soda Maker, x1 Cylinder & x8 Premium Flavors",
            features: [
              "Premium soda maker setup",
              "8 premium Italian flavors",
              "Luxury experience",
              "Perfect for entertaining",
              "Restaurant-quality flavors",
              "Ultimate value package"
            ],
            specifications: {
              "Soda Maker": "Drinkmate OmniFizz (Red)",
              "CO2 Cylinders": "1x 60L cylinder",
              "Flavors Included": "8 premium Italian syrups",
              "Total Value": "SAR 1,499.00",
              "Bundle Savings": "SAR 200.00",
              "Warranty": "2 years on machine, 1 year on accessories"
            }
          },
          features: {
            completeSetup: "Complete soda maker setup",
            multipleCylinders: "Multiple CO2 cylinders for extended use",
            varietyFlavors: "Variety of premium Italian flavors",
            familyGatherings: "Perfect for family gatherings",
            greatValue: "Great value for money",
            easyUse: "Easy to use and maintain"
          },
          specifications: {
            sodaMaker: "Soda Maker",
            co2Cylinders: "CO2 Cylinders",
            flavorsIncluded: "Flavors Included",
            totalValue: "Total Value",
            bundleSavings: "Bundle Savings",
            warranty: "Warranty",
            // Starter bundle specific values
            starterSodaMaker: "Drinkmate OmniFizz (Hero)",
            starterCo2Cylinders: "1x 60L cylinder",
            starterFlavors: "2 premium Italian syrups",
            starterTotalValue: "SAR 899.00",
            starterBundleSavings: "SAR 100.00",
            starterWarranty: "2 years on machine, 1 year on accessories",
            // Family bundle specific values
            familySodaMaker: "Drinkmate OmniFizz (Blue)",
            familyCo2Cylinders: "2x 60L cylinders",
            familyFlavors: "5 premium Italian syrups",
            familyTotalValue: "SAR 1,199.00",
            familyBundleSavings: "SAR 200.00",
            familyWarranty: "2 years on machine, 1 year on accessories",
            // Premium bundle specific values
            premiumSodaMaker: "Drinkmate OmniFizz (Red)",
            premiumCo2Cylinders: "1x 60L cylinder",
            premiumFlavors: "8 premium Italian syrups",
            premiumTotalValue: "SAR 1,499.00",
            premiumBundleSavings: "SAR 200.00",
            premiumWarranty: "2 years on machine, 1 year on accessories"
          }
        }
      }
    },
    recipes: {
      hero: {
        title: "Create Amazing",
        subtitle: "Drink Recipes",
        description: "Discover delicious and refreshing drink recipes using our premium Italian syrups. From classic favorites to creative combinations, there's something for everyone!",
        exploreRecipes: "Explore Recipes",
        downloadPDF: "Download PDF",
        recipesCountNumber: "45+",
        recipesLabel: "Recipes"
      },
      featuredRecipe: {
        recipeOfTheWeek: "Recipe of the Week",
        description: "This week's featured recipe showcases the perfect balance of flavors and is perfect for any occasion.",
        prepTime: "Prep Time",
        difficulty: "Difficulty",
        ingredients: "Ingredients",
        instructions: "Instructions",
        saveRecipe: "Save Recipe",
        share: "Share"
      },
      categories: {
        all: "All",
        fruity: "Fruity",
        citrus: "Citrus",
        berry: "Berry",
        cola: "Cola"
      },
      recipeData: {
        italianStrawberryLemonade: {
          name: "Italian Strawberry Lemonade",
          category: "Fruity",
          difficulty: "Easy",
          time: "5 min",
          instructions: "Mix strawberry lemon syrup with sparkling water, add fresh lemon slices and ice. Garnish with mint leaves for extra freshness."
        },
        cherryColaFizz: {
          name: "Cherry Cola Fizz",
          category: "Cola",
          difficulty: "Easy",
          time: "3 min",
          instructions: "Combine cherry cola syrup with sparkling water and ice. Serve immediately for maximum fizz."
        },
        blueRaspberryBlast: {
          name: "Blue Raspberry Blast",
          category: "Berry",
          difficulty: "Medium",
          time: "7 min",
          instructions: "Mix blue raspberry syrup with sparkling water, add fresh blueberries and mint. Garnish with a sprig of mint."
        },
        limeMojitoSparkle: {
          name: "Lime Mojito Sparkle",
          category: "Citrus",
          difficulty: "Medium",
          time: "8 min",
          instructions: "Combine lime syrup with sparkling water, add fresh lemon, mint leaves, sugar, and ice. Stir gently to mix flavors."
        },
        orangeCreamsicle: {
          name: "Orange Creamsicle",
          category: "Fruity",
          difficulty: "Easy",
          time: "4 min",
          instructions: "Mix orange and vanilla syrups with sparkling water, add cream and ice. Stir gently to create a creamy texture."
        },
        grapeSodaSupreme: {
          name: "Grape Soda Supreme",
          category: "Fruity",
          difficulty: "Easy",
          time: "3 min",
          instructions: "Combine grape syrup with sparkling water and ice. Serve immediately for the best carbonation."
        }
      },
      ingredients: {
        strawberryLemonSyrup: "Strawberry Lemon Syrup",
        cherryColaSyrup: "Cherry Cola Syrup",
        blueRaspberrySyrup: "Blue Raspberry Syrup",
        limeSyrup: "Lime Syrup",
        orangeSyrup: "Orange Syrup",
        vanillaSyrup: "Vanilla Syrup",
        grapeSyrup: "Grape Syrup",
        sparklingWater: "Sparkling Water",
        freshLemon: "Fresh Lemon",
        freshBlueberries: "Fresh Blueberries",
        mint: "Mint",
        mintLeaves: "Mint Leaves",
        sugar: "Sugar",
        cream: "Cream",
        ice: "Ice"
      },
      tags: {
        refreshing: "Refreshing",
        summer: "Summer",
        popular: "Popular",
        classic: "Classic",
        bold: "Bold",
        fizzy: "Fizzy",
        berry: "Berry",
        gourmet: "Gourmet",
        citrus: "Citrus",
        mojito: "Mojito",
        fresh: "Fresh",
        creamy: "Creamy",
        orange: "Orange",
        dessert: "Dessert",
        grape: "Grape",
        simple: "Simple"
      },
      recipeCard: {
        reviews: "reviews",
        ingredients: "ingredients",
        viewRecipe: "View Recipe"
      },
      newsletter: {
        title: "Get New Recipes Weekly",
        description: "Subscribe to our newsletter and receive new drink recipes, tips, and exclusive offers every week!",
        emailPlaceholder: "Enter your email",
        subscribe: "Subscribe"
      },
      difficultyLevels: {
        title: "Recipe Difficulty Levels",
        subtitle: "Choose recipes that match your skill level and experience",
        beginner: {
          title: "Beginner",
          description: "Perfect for those new to making sparkling drinks",
          feature1: "Simple ingredients",
          feature2: "Basic techniques",
          feature3: "Quick preparation"
        },
        intermediate: {
          title: "Intermediate",
          description: "Great for those with some experience",
          feature1: "Multiple ingredients",
          feature2: "Basic garnishing",
          feature3: "Flavor combinations"
        },
        advanced: {
          title: "Advanced",
          description: "For experienced drink makers",
          feature1: "Complex recipes",
          feature2: "Advanced techniques",
          feature3: "Creative presentations"
        }
      },
      seasonalRecipes: {
        title: "Seasonal Recipe Collections",
        subtitle: "Discover recipes perfect for every season",
        spring: {
          title: "Spring",
          description: "Light and refreshing flavors"
        },
        summer: {
          title: "Summer",
          description: "Cool and tropical combinations"
        },
        autumn: {
          title: "Autumn",
          description: "Warm and cozy flavors"
        },
        winter: {
          title: "Winter",
          description: "Rich and comforting drinks"
        }
      },
      communityRecipes: {
        title: "Community Recipes",
        subtitle: "Amazing recipes shared by our community",
        tropicalParadise: {
          title: "Tropical Paradise",
          description: "A refreshing blend of tropical fruits with a hint of coconut",
          by: "by Sarah M.",
          verified: "Verified"
        },
        berryBlast: {
          title: "Berry Blast",
          description: "Mixed berry explosion with mint and lime",
          by: "by Ahmed K.",
          verified: "Verified"
        },
        submitYourRecipe: "Submit Your Recipe"
      },
      nutritionalInfo: {
        title: "Nutritional Information",
        subtitle: "Learn about the health benefits and nutritional content of our drinks",
        calorieUnit: "calories",
        calorieContent: {
          title: "Calorie Content",
          plainSparklingWater: "Plain Sparkling Water",
          withNaturalSyrup: "With Natural Syrup",
          premiumSyrupMix: "Premium Syrup Mix"
        },
        healthBenefits: {
          title: "Health Benefits",
          benefit1: "Hydration without added sugars",
          benefit2: "Natural flavors from real ingredients",
          benefit3: "Low-calorie alternative to sodas"
        },
        allergenInfo: {
          title: "Allergen Information",
          info1: "All syrups are gluten-free",
          info2: "Made with natural ingredients",
          info3: "No artificial preservatives"
        }
      }
    },
    trackOrder: {
      hero: {
        title: "Track Your Order",
        subtitle: "Stay updated on your Drinkmate order with real-time tracking. Enter your order number and email to get detailed status updates."
      },
      form: {
        title: "Track Your Order",
        subtitle: "Enter your order details to get real-time updates",
        orderNumber: "Order Number *",
        orderNumberPlaceholder: "e.g., ORD-2024-001",
        email: "Email Address *",
        emailPlaceholder: "Enter your email",
        trackOrder: "Track Order"
      },
      results: {
        title: "Order Status",
        orderNumber: "Order #",
        currentStatus: "Current Status",
        estimatedDelivery: "Estimated Delivery",
        currentLocation: "Current Location",
        trackingHistory: "Tracking History"
      },
      recentOrders: {
        title: "Recent Orders",
        subtitle: "Quick access to your order history",
        orderDate: "Order Date",
        items: "Items",
        total: "Total",
        trackThisOrder: "Track This Order"
      },
      orderHistory: {
        title: "Order History",
        subtitle: "View and manage all your past orders",
        allOrders: "All Orders",
        viewAllOrders: "View All Orders",
        orderId: "Order ID",
        date: "Date",
        status: "Status",
        total: "Total",
        actions: "Actions",
        track: "Track"
      },
      delivery: {
        title: "Delivery & Shipping",
        subtitle: "Everything you need to know about delivery",
        standardDelivery: "Standard Delivery",
        standardDeliveryTime: "3-5 business days",
        standardDeliveryNote: "Free on orders above 150 SAR",
        expressDelivery: "Express Delivery",
        expressDeliveryTime: "1-2 business days",
        expressDeliveryNote: "Additional fee applies",
        localPickup: "Local Pickup",
        localPickupTime: "Same day available",
        localPickupNote: "From our Riyadh office"
      },
      returns: {
        title: "Return & Exchange Policy",
        subtitle: "Hassle-free returns and exchanges",
        returnPolicy: "Return Policy",
        returnPolicyItems: {
          item1: "30-day return window for most products",
          item2: "Items must be in original condition",
          item3: "Free return shipping",
          item4: "Full refund or exchange"
        },
        exchangePolicy: "Exchange Policy",
        exchangePolicyItems: {
          item1: "Size or color exchanges available",
          item2: "Defective product replacement",
          item3: "CO2 cylinder exchange program",
          item4: "No restocking fees"
        }
      },
      notifications: {
        title: "Stay Updated",
        subtitle: "Get real-time delivery notifications",
        deliveryNotifications: "Delivery Notifications",
        description: "Never miss a delivery update! We'll send you notifications at every step of your order journey.",
        items: {
          item1: "Order confirmation",
          item2: "Shipping updates",
          item3: "Delivery alerts",
          item4: "Real-time tracking"
        },
        enableNotifications: "Enable Notifications",
        learnMore: "Learn More",
        getNotified: "Get notified at every step"
      },
      status: {
        orderPlaced: "Order Placed",
        processing: "Processing",
        shipped: "Shipped",
        inTransit: "In Transit",
        delivered: "Delivered"
      },
      help: {
        title: "Need Help with Your Order?",
        subtitle: "Our customer support team is here to assist you with any questions about your Drinkmate order.",
        callUs: "Call Us",
        callUsNumber: "+966 11 234 5678",
        callUsNote: "Available Sunday to Thursday, 9:00 AM - 6:00 PM (Riyadh time)",
        emailUs: "Email Us",
        emailUsAddress: "support@drinkmate.sa",
        emailUsNote: "We'll respond within 24 hours on business days"
      }
    },
    blog: {
      hero: {
        title: "Blog & News",
        subtitle: "Stay Updated",
        description: "Discover the latest news, tips, and insights about Drinkmate products and the world of sparkling beverages."
      },
      featuredPost: {
        title: "Featured Post",
        readMore: "Read More",
        publishedOn: "Published on",
        author: "by",
        category: "Category"
      },
      categories: {
        all: "All",
        news: "News",
        tips: "Tips & Tricks",
        recipes: "Recipes",
        company: "Company",
      science: "Science",
      guide: "Guide",
      products: "Products",
      environment: "Environment",
      health: "Health",
      lifestyle: "Lifestyle"
      },
      search: {
        placeholder: "Search articles...",
        searchButton: "Search"
      },
      newsletter: {
        title: "Stay Updated",
        description: "Get the latest blog posts and news delivered to your inbox",
        emailPlaceholder: "Enter your email",
        subscribe: "Subscribe"
      },
              pagination: {
          previous: "Previous",
          next: "Next",
          page: "Page",
          of: "of"
        },
        blogPosts: {
          readTime: "min read",
          publishedOn: "Published on",
          author: "Author",
          category: "Category",
          backToBlog: "Back to Blog",
          shareThisPost: "Share this post",
          relatedPosts: "Related Posts",
          tags: "Tags",
          comments: "Comments",
          leaveComment: "Leave a comment",
          commentPlaceholder: "Write your comment here...",
          postComment: "Post Comment",
          likePost: "Like",
          likedPost: "Liked",
          // Blog post content translations
          postTitles: {
            post1: "10 Refreshing Summer Drink Recipes with Drinkmate",
            post2: "The Science Behind Perfect Carbonation",
            post3: "How to Choose the Perfect CO2 Cylinder for Your Drinkmate",
            post4: "Top 5 Premium Italian Syrups for Your Drinkmate",
            post5: "Environmental Impact: How Drinkmate Reduces Plastic Waste",
            post6: "Health Benefits of Carbonated Water: Myths vs. Facts",
            post7: "How to Host the Perfect Carbonation Party with Drinkmate"
          },
          postExcerpts: {
            post1: "Beat the summer heat with these delicious and easy-to-make sparkling drink recipes using your Drinkmate machine.",
            post2: "Learn about the chemistry of carbonation and how Drinkmate technology creates the perfect fizz every time.",
            post3: "Learn how to choose the perfect CO2 cylinder size for your Drinkmate machine based on usage, cost, and convenience.",
            post4: "Discover the top 5 premium Italian syrups that will transform your Drinkmate beverages into authentic Italian delights.",
            post5: "Discover how your Drinkmate machine helps reduce plastic waste and protect the environment while saving money.",
            post6: "Discover the truth about carbonated water health benefits and debunk common myths with scientific evidence.",
            post7: "Learn how to host an unforgettable carbonation party that will showcase your Drinkmate machine and impress your guests."
          },
          postAuthors: {
            drinkmateTeam: "Drinkmate Team",
            ahmedHassan: "Dr. Ahmed Hassan",
            sarahJohnson: "Dr. Sarah Johnson",
            environmentalTeam: "Environmental Team"
          },
          postDates: {
            jan15: "January 15, 2024",
            jan12: "January 12, 2024",
            jan10: "January 10, 2024",
            jan8: "January 8, 2024",
            jan5: "January 5, 2024",
            jan3: "January 3, 2024",
            dec30: "December 30, 2023"
          },
          post1: {
            title: "10 Refreshing Summer Drink Recipes with Drinkmate",
            subtitle: "Beat the Summer Heat with Homemade Sparkling Drinks!",
            intro: "Summer is here, and what better way to beat the heat than with refreshing, homemade sparkling drinks? Your Drinkmate machine makes it incredibly easy to create delicious beverages that are not only tasty but also healthier than store-bought alternatives. Say goodbye to artificial flavors and hello to natural, customizable refreshments!",
            whyMake: {
              title: "Why Make Your Own Sparkling Drinks?",
              health: {
                title: "Health Benefits",
                benefit1: "No artificial preservatives or colors",
                benefit2: "Control over sweetness levels",
                benefit3: "Natural ingredients only",
                benefit4: "Lower sugar content"
              },
              cost: {
                title: "Cost Savings",
                saving1: "70% cheaper than store-bought",
                saving2: "Reusable bottles",
                saving3: "Bulk ingredient purchases",
                saving4: "No transportation costs"
              }
            },
            excerpt: "Beat the summer heat with these delicious and easy-to-make sparkling drink recipes using your Drinkmate machine.",
            author: "Drinkmate Team",
            date: "January 15, 2024",
            tags: {
              recipes: "Recipes",
              summer: "Summer",
              refreshing: "Refreshing",
              healthy: "Healthy",
              sparkling: "Sparkling"
            }
          },
          post2: {
            title: "The Science Behind Perfect Carbonation",
            content: "Content for science post...",
            excerpt: "Learn about the chemistry of carbonation and how Drinkmate technology creates the perfect fizz every time.",
            author: "Dr. Ahmed Hassan",
            date: "January 12, 2024",
            tags: {
              science: "Science",
              chemistry: "Chemistry",
              carbonation: "Carbonation",
              technology: "Technology"
            }
          },
          post3: {
            title: "How to Choose the Perfect CO2 Cylinder for Your Drinkmate",
            content: "Content for guide post...",
            excerpt: "Learn how to choose the perfect CO2 cylinder size for your Drinkmate machine based on usage, cost, and convenience.",
            author: "Drinkmate Team",
            date: "January 10, 2024",
            tags: {
              guide: "Guide",
              co2: "CO2",
              equipment: "Equipment",
              tips: "Tips"
            }
          },
          post4: {
            title: "Top 5 Premium Italian Syrups for Your Drinkmate",
            content: "Content for products post...",
            excerpt: "Discover the top 5 premium Italian syrups that will transform your Drinkmate beverages into authentic Italian delights.",
            author: "Drinkmate Team",
            date: "January 8, 2024",
            tags: {
              products: "Products",
              italian: "Italian",
              syrups: "Syrups",
              premium: "Premium"
            }
          },
          post5: {
            title: "Environmental Impact: How Drinkmate Reduces Plastic Waste",
            content: "Content for environment post...",
            excerpt: "Discover how your Drinkmate machine helps reduce plastic waste and protect the environment while saving money.",
            author: "Environmental Team",
            date: "January 5, 2024",
            tags: {
              environment: "Environment",
              plastic: "Plastic",
              sustainability: "Sustainability",
              green: "Green"
            }
          },
          post6: {
            title: "Health Benefits of Carbonated Water: Myths vs. Facts",
            content: "Content for health post...",
            excerpt: "Discover the truth about carbonated water health benefits and debunk common myths with scientific evidence.",
            author: "Dr. Sarah Johnson",
            date: "January 3, 2024",
            tags: {
              health: "Health",
              benefits: "Benefits",
              myths: "Myths",
              science: "Science"
            }
          },
          post7: {
            title: "How to Host the Perfect Carbonation Party with Drinkmate",
            content: "Content for lifestyle post...",
            excerpt: "Learn how to host an unforgettable carbonation party that will showcase your Drinkmate machine and impress your guests.",
            author: "Drinkmate Team",
            date: "December 30, 2023",
            tags: {
              party: "Party",
              entertainment: "Entertainment",
              social: "Social",
              lifestyle: "Lifestyle",
              carbonation: "Carbonation"
            }
          },
          authorBio: {
            team: "Our expert team of beverage enthusiasts and carbonation specialists who are passionate about helping you create the perfect sparkling drinks at home.",
            expert: "A passionate expert in their field, dedicated to sharing knowledge and insights about carbonation technology and beverage science."
          }
        }
    },
    privacyPolicy: {
      hero: {
        title: "Privacy Policy",
        subtitle: "How we protect your information",
        lastUpdated: "Last updated: January 2024"
      },
      sections: {
        informationWeCollect: {
          title: "Information We Collect",
          description: "We collect information to provide better services to our customers.",
          personalInfo: "Personal Information",
          usageData: "Usage Data",
          cookies: "Cookies and Tracking Technologies"
        },
        howWeUseInformation: {
          title: "How We Use Your Information",
          description: "We use the information we collect to provide, maintain, and improve our services.",
          purposes: [
            "Process and fulfill your orders",
            "Provide customer support",
            "Send you updates and marketing communications",
            "Improve our products and services",
            "Ensure security and prevent fraud"
          ]
        },
        informationSharing: {
          title: "Information Sharing",
          description: "We do not sell, trade, or otherwise transfer your personal information to third parties.",
          exceptions: [
            "With your explicit consent",
            "To comply with legal obligations",
            "To protect our rights and safety",
            "With trusted service providers"
          ]
        },
        dataSecurity: {
          title: "Data Security",
          description: "We implement appropriate security measures to protect your personal information.",
          measures: [
            "Encryption of sensitive data",
            "Regular security assessments",
            "Access controls and authentication",
            "Secure data transmission"
          ]
        },
        yourRights: {
          title: "Your Rights",
          description: "You have certain rights regarding your personal information.",
          rights: [
            "Access your personal data",
            "Correct inaccurate information",
            "Request deletion of your data",
            "Opt-out of marketing communications",
            "Data portability"
          ]
        },
        contactUs: {
          title: "Contact Us",
          description: "If you have questions about this Privacy Policy, please contact us.",
          email: "privacy@drinkmate.sa",
          phone: "+966 50 123 4567"
        },
        personalInfoDetails: {
          nameContact: "Name and contact information (email, phone, address)",
          paymentBilling: "Payment and billing information",
          orderHistory: "Order history and preferences",
          customerService: "Customer service communications"
        },
        usageDataDetails: {
          ipDevice: "IP address and device information",
          websiteUsage: "Website usage data and analytics",
          browserOS: "Browser type and operating system"
        },
        cookiesDetails: {
          trackingTech: "Cookies and tracking technologies",
          sessionData: "Session data and preferences",
          thirdPartyAnalytics: "Third-party analytics"
        },
        purposesDetails: {
          processOrders: "Process and fulfill your orders",
          customerSupport: "Provide customer support",
          updatesMarketing: "Send you updates and marketing communications",
          improveServices: "Improve our products and services",
          securityFraud: "Ensure security and prevent fraud"
        },
        exceptionsDetails: {
          explicitConsent: "With your explicit consent",
          legalObligations: "To comply with legal obligations",
          protectRights: "To protect our rights and safety",
          trustedProviders: "With trusted service providers"
        },
        securityDetails: {
          encryption: "Encryption of sensitive data",
          securityAssessments: "Regular security assessments",
          accessControls: "Access controls and authentication",
          secureTransmission: "Secure data transmission"
        },
        rightsDetails: {
          accessData: "Access your personal data",
          correctInfo: "Correct inaccurate information",
          deleteData: "Request deletion of your data",
          optOutMarketing: "Opt-out of marketing communications",
          dataPortability: "Data portability"
        },
        address: "Riyadh, Saudi Arabia"
      }
    },
    termsOfService: {
      hero: {
        title: "Terms of Service",
        subtitle: "Our terms and conditions",
        lastUpdated: "Last updated: January 2024"
      },
      sections: {
        acceptance: {
          title: "Acceptance of Terms",
          description: "By using our website and services, you agree to these terms and conditions."
        },
        services: {
          title: "Services",
          description: "We provide soda makers, CO2 cylinders, and related products and services.",
          included: [
            "Product sales and delivery",
            "CO2 refill and exchange services",
            "Customer support and warranty",
            "Online ordering and tracking"
          ]
        },
        userObligations: {
          title: "User Obligations",
          description: "Users must comply with all applicable laws and regulations.",
          obligations: [
            "Provide accurate information",
            "Use products safely and as intended",
            "Respect intellectual property rights",
            "Maintain account security"
          ]
        },
        payment: {
          title: "Payment Terms",
          description: "Payment is required at the time of order placement.",
          terms: [
            "All prices are in SAR",
            "Payment methods accepted: Credit cards, bank transfer",
            "Orders are processed after payment confirmation",
            "Refunds processed within 5-7 business days"
          ]
        },
        shipping: {
          title: "Shipping Policy",
          description: "We offer various shipping options to meet your needs.",
          policies: [
            "Free shipping on orders above 150 SAR",
            "Standard delivery: 3-5 business days",
            "Express delivery: 1-2 business days",
            "Local pickup available in Riyadh"
          ]
        },
        returns: {
          title: "Return Policy",
          description: "We offer a 30-day return window for most products.",
          policy: [
            "Items must be in original condition",
            "Free return shipping",
            "Full refund or exchange",
            "CO2 cylinders not eligible for return"
          ]
        },
        warranty: {
          title: "Warranty",
          description: "Our products come with manufacturer warranties.",
          coverage: [
            "2-year warranty on soda makers",
            "1-year warranty on accessories",
            "Warranty covers manufacturing defects",
            "Normal wear and tear not covered"
          ]
        },
        liability: {
          title: "Limitation of Liability",
          description: "Our liability is limited to the extent permitted by law.",
          limitations: [
            "Maximum liability: purchase price of product",
            "No liability for indirect damages",
            "No liability for misuse of products",
            "Force majeure events excluded"
          ]
        },
        termination: {
          title: "Termination",
          description: "We may terminate services for violations of these terms.",
          conditions: [
            "Violation of terms and conditions",
            "Fraudulent or illegal activities",
            "Non-payment of fees",
            "Abuse of services"
          ]
        },
        contact: {
          title: "Contact Information",
          description: "For questions about these terms, please contact us.",
          email: "legal@drinkmate.sa",
          phone: "+966 50 123 4567"
        },
        servicesDetails: {
          productSales: "Product sales and delivery",
          co2Services: "CO2 refill and exchange services",
          customerSupport: "Customer support and warranty",
          onlineOrdering: "Online ordering and tracking"
        },
        obligationsDetails: {
          accurateInfo: "Provide accurate information",
          safeUsage: "Use products safely and as intended",
          intellectualProperty: "Respect intellectual property rights",
          accountSecurity: "Maintain account security"
        },
        paymentDetails: {
          sarPrices: "All prices are in SAR",
          paymentMethods: "Payment methods accepted: Credit cards, bank transfer",
          orderProcessing: "Orders are processed after payment confirmation",
          refundTiming: "Refunds processed within 5-7 business days"
        },
        shippingDetails: {
          freeShipping: "Free shipping on orders above 150 SAR",
          standardDelivery: "Standard delivery: 3-5 business days",
          expressDelivery: "Express delivery: 1-2 business days",
          localPickup: "Local pickup available in Riyadh"
        },
        returnsDetails: {
          originalCondition: "Items must be in original condition",
          freeReturn: "Free return shipping",
          fullRefund: "Full refund or exchange",
          co2NotEligible: "CO2 cylinders not eligible for return"
        },
        warrantyDetails: {
          sodaMakerWarranty: "2-year warranty on soda makers",
          accessoriesWarranty: "1-year warranty on accessories",
          manufacturingDefects: "Warranty covers manufacturing defects",
          normalWear: "Normal wear and tear not covered"
        },
        liabilityDetails: {
          maxLiability: "Maximum liability: purchase price of product",
          noIndirectDamages: "No liability for indirect damages",
          noMisuseLiability: "No liability for misuse of products",
          forceMajeure: "Force majeure events excluded"
        },
        terminationDetails: {
          termsViolation: "Violation of terms and conditions",
          fraudulentActivities: "Fraudulent or illegal activities",
          nonPayment: "Non-payment of fees",
          serviceAbuse: "Abuse of services"
        },
        address: "Riyadh, Saudi Arabia"
      }
    },
    cookiePolicy: {
      hero: {
        title: "Cookie Policy",
        subtitle: "How we use cookies",
        lastUpdated: "Last updated: January 2024"
      },
      sections: {
        whatAreCookies: {
          title: "What Are Cookies?",
          description: "Cookies are small text files stored on your device when you visit our website."
        },
        howWeUseCookies: {
          title: "How We Use Cookies",
          description: "We use cookies to enhance your browsing experience and provide personalized content.",
          purposes: [
            "Remember your preferences and settings",
            "Analyze website traffic and usage",
            "Provide personalized content and ads",
            "Improve website functionality",
            "Ensure security and prevent fraud"
          ]
        },
        typesOfCookies: {
          title: "Types of Cookies We Use",
          essential: "Essential cookies are necessary for the website to function properly.",
          analytics: "Analytics cookies help us understand how visitors use our website.",
          marketing: "Marketing cookies are used to deliver relevant advertisements.",
          preferences: "Preference cookies remember your choices and settings."
        },
        managingCookies: {
          title: "Managing Cookies",
          description: "You can control and manage cookies through your browser settings.",
          browser: "Browser Settings",
          settings: "Most browsers allow you to block or delete cookies."
        },
        thirdPartyCookies: {
          title: "Third-Party Cookies",
          description: "Some cookies are placed by third-party services we use.",
          services: [
            "Google Analytics for website analytics",
            "Facebook Pixel for advertising",
            "Payment processors for secure transactions",
            "Social media platforms for sharing"
          ]
        },
        updates: {
          title: "Policy Updates",
          description: "We may update this Cookie Policy from time to time. Please check back regularly."
        },
        contact: {
          title: "Contact Us",
          description: "If you have questions about our use of cookies, please contact us.",
          email: "privacy@drinkmate.sa"
        },
        purposesDetails: {
          rememberPreferences: "Remember your preferences and settings",
          analyzeTraffic: "Analyze website traffic and usage",
          personalizedContent: "Provide personalized content and ads",
          improveFunctionality: "Improve website functionality",
          ensureSecurity: "Ensure security and prevent fraud"
        },
        thirdPartyServices: {
          googleAnalytics: "Google Analytics for website analytics",
          facebookPixel: "Facebook Pixel for advertising",
          paymentProcessors: "Payment processors for secure transactions",
          socialMedia: "Social media platforms for sharing"
        },
        address: "Riyadh, Saudi Arabia"
      }
    },
    co2: {
      hero: {
        title: "CO2 Solutions",
        subtitle: "Keep your drinks sparkling",
        description: "Premium food-grade CO2 cylinders and convenient exchange services. Maintain your Drinkmate experience with reliable CO2 solutions.",
        orderCO2: "Order CO2",
        learnMore: "Learn More",
        drinksLabel: "Drinks",
        liters: "60L"
      },
      productOptions: {
        title: "CO2 Cylinder Options",
        subtitle: "Choose the perfect CO2 solution for your needs",
        singleCylinder: {
          title: "Single Cylinder",
          description: "Perfect for individual use",
          capacity: "60 liters",
          price: "99 SAR",
          lifespan: "2-3 months",
          orderNow: "Order Now"
        },
        exchangeProgram: {
          title: "Exchange Program",
          description: "Return empty, get full",
          exchangeFee: "55 SAR",
          convenience: "Hassle-free",
          ecoFriendly: "Eco-friendly",
          exchangeNow: "Exchange Now"
        },
        bulkOrders: {
          title: "Bulk Orders",
          description: "For businesses & events",
          minQuantity: "10 cylinders",
          discount: "15% discount",
          delivery: "Free delivery",
          getQuote: "Get Quote"
        }
      },
      refillServices: {
        title: "CO2 Refill Services",
        subtitle: "Professional refilling with safety standards",
        safetyFirst: {
          title: "Safety First",
          description: "All our CO2 cylinders are food-grade certified and undergo rigorous safety inspections.",
          foodGradeCertification: "Food-grade CO2 certification",
          regularSafetyInspections: "Regular safety inspections",
          properHandlingProcedures: "Proper handling procedures",
          emergencyProtocols: "Emergency protocols"
        },
        convenientDelivery: {
          title: "Convenient Delivery",
          description: "We offer fast and reliable delivery services to your doorstep.",
          sameDayDelivery: "Same-day delivery available",
          flexibleScheduling: "Flexible scheduling",
          professionalHandling: "Professional handling",
          realTimeTracking: "Real-time tracking"
        }
      },
      exchangeProgram: {
        title: "CO2 Exchange Program",
        subtitle: "Sustainable and cost-effective solution",
        howItWorks: "How It Works",
        step1: {
          title: "Return Empty Cylinder",
          description: "Send back your empty cylinder"
        },
        step2: {
          title: "Get Full Cylinder",
          description: "Receive a fresh, full CO2 cylinder"
        },
        step3: {
          title: "Pay Difference Only",
          description: "Save up to 40% compared to new"
        },
        saveMoney: "Save money",
        ecoFriendly: "Eco-Friendly"
      },
      safetyHandling: {
        title: "CO2 Safety & Handling",
        subtitle: "Important guidelines for safe CO2 usage",
        safetyGuidelines: {
          title: "Safety Guidelines",
          guideline1: "Store in cool, dry place",
          guideline2: "Use proper container for transport",
          guideline3: "Follow safety instructions for disposal",
          guideline4: "Do not expose to high heat"
        },
        properUsage: {
          title: "Proper Usage",
          usage1: "Read instructions carefully",
          usage2: "Use proper equipment",
          usage3: "Check cylinder integrity",
          usage4: "Maintain usage records"
        }
      },
      environmentalImpact: {
        title: "Environmental Impact",
        subtitle: "Our commitment to sustainability",
        reducedWaste: {
          title: "Reduced Waste",
          description: "Reusable cylinders minimize single-use containers"
        },
        circularEconomy: {
          title: "Circular Economy",
          description: "Sustainable exchange system"
        },
        safeDisposal: {
          title: "Safe Disposal",
          description: "Proper disposal guidelines"
        }
      },
      businessSolutions: {
        title: "Business Solutions",
        subtitle: "Custom services for businesses",
        restaurantsCafes: {
          title: "Restaurants & Cafes",
          description: "Tailored CO2 solutions for food industry",
          feature1: "Wholesale pricing",
          feature2: "Scheduled deliveries",
          feature3: "Custom support",
          feature4: "24/7 service",
          getBusinessQuote: "Get Business Quote"
        },
        eventsCatering: {
          title: "Events & Catering",
          description: "Services for special events",
          feature1: "Event planning",
          feature2: "Hospitality service",
          feature3: "Professional equipment",
          feature4: "Event support",
          eventPlanning: "Event Planning"
        }
      }
    },
    // recipes: {
    //   hero: {
    //     title: "Create Recipes",
    //     subtitle: "Amazing Drinks",
    //     description: "Discover delicious and refreshing drink recipes using our premium Italian syrups. From classic favorites to creative blends, there's something for everyone!",
    //     exploreRecipes: "Explore Recipes",
    //     downloadPDF: "Download PDF",
    //     recipesCountNumber: "+45",
    //     recipesLabel: "Recipe"
    //   },
    //   featuredRecipe: {
    //     recipeOfTheWeek: "Recipe of the Week",
    //     description: "This week's featured recipe offers the perfect balance of flavors and is ideal for any occasion.",
    //     prepTime: "Preparation Time",
    //     difficulty: "Difficulty",
    //     ingredients: "Ingredients",
    //     instructions: "Instructions",
    //     saveRecipe: "Save Recipe",
    //     share: "Share"
    //   },
    //   categories: {
    //     all: "All",
    //     fruity: "Fruity",
    //     citrus: "Citrus",
    //     berry: "Berry",
    //     cola: "Cola"
    //   },
    //   recipeData: {
    //     italianStrawberryLemonade: {
    //       name: "Italian Strawberry Lemonade",
    //       category: "Fruity",
    //       difficulty: "Easy",
    //       time: "5 minutes",
    //       instructions: "Mix strawberry and lemon syrup with sparkling water, add fresh lemon slices and ice. Garnish with mint leaves for extra freshness."
    //     },
    //     cherryColaFizz: {
    //       name: "Cherry Cola Fizz",
    //       category: "Cola",
    //       difficulty: "Easy",
    //       time: "3 minutes",
    //       instructions: "Mix cherry cola syrup with sparkling water and ice. Serve immediately for maximum fizz."
    //     },
    //     blueRaspberryBlast: {
    //       name: "Blue Raspberry Blast",
    //       category: "Berry",
    //       difficulty: "Medium",
    //       time: "7 minutes",
    //       instructions: "Mix blue raspberry syrup with sparkling water, add fresh blueberries and mint. Garnish with a mint sprig."
    //     },
    //     limeMojitoSparkle: {
    //       name: "Lime Mojito Sparkle",
    //       category: "Citrus",
    //       difficulty: "Medium",
    //       time: "8 minutes",
    //       instructions: "Mix lime syrup with sparkling water, add fresh lime, mint leaves, sugar, and ice. Stir gently to blend the flavors."
    //     },
    //     orangeCreamsicle: {
    //       name: "Orange Creamsicle",
    //       category: "Fruity",
    //       difficulty: "Easy",
    //       time: "4 minutes",
    //       instructions: "Mix orange and vanilla syrup with sparkling water, add cream and ice. Stir gently for a creamy texture."
    //     },
    //     grapeSodaSupreme: {
    //       name: "Grape Soda Supreme",
    //       category: "Fruity",
    //       difficulty: "Easy",
    //       time: "3 minutes",
    //       instructions: "Mix grape syrup with sparkling water and ice. Serve immediately for the best carbonation."
    //     }
    //   },
    //   ingredients: {
    //     strawberryLemonSyrup: "Strawberry Lemon Syrup",
    //     cherryColaSyrup: "Cherry Cola Syrup",
    //     blueRaspberrySyrup: "Blue Raspberry Syrup",
    //     limeSyrup: "Lime Syrup",
    //     orangeSyrup: "Orange Syrup",
    //     vanillaSyrup: "Vanilla Syrup",
    //     grapeSyrup: "Grape Syrup",
    //     sparklingWater: "Sparkling Water",
    //     freshLemon: "Fresh Lemon",
    //     freshBlueberries: "Fresh Blueberries",
    //     mint: "Mint",
    //     mintLeaves: "Mint Leaves",
    //     sugar: "Sugar",
    //     cream: "Cream",
    //     ice: "Ice"
    //   },
    //   tags: {
    //     refreshing: "Refreshing",
    //     summer: "Summer",
    //     popular: "Popular",
    //     classic: "Classic",
    //     bold: "Bold",
    //     fizzy: "Fizzy",
    //     berry: "Berry",
    //     gourmet: "Gourmet",
    //     citrus: "Citrus",
    //     mojito: "Mojito",
    //     fresh: "Fresh",
    //     creamy: "Creamy",
    //     orange: "Orange",
    //     dessert: "Dessert",
    //     grape: "Grape",
    //     simple: "Simple"
    //   },
    //   recipeCard: {
    //     reviews: "Reviews",
    //     ingredients: "Ingredients",
    //     viewRecipe: "View Recipe"
    //   },
    //   newsletter: {
    //     title: "Get New Recipes Weekly",
    //     description: "Subscribe to our newsletter and receive new drink recipes, tips, and exclusive offers every week!",
    //     emailPlaceholder: "Enter your email",
    //     subscribe: "Subscribe"
    //   },
    //   difficultyLevels: {
    //     title: "Recipe Difficulty Levels",
    //     subtitle: "Choose recipes that match your skill and experience level",
    //     beginner: {
    //       title: "Beginner",
    //       description: "Perfect for those new to making sparkling drinks",
    //       feature1: "Simple ingredients",
    //       feature2: "Basic techniques",
    //       feature3: "Quick preparation"
    //     },
    //     intermediate: {
    //       title: "Intermediate",
    //       description: "Great for those with some experience",
    //       feature1: "Multiple ingredients",
    //       feature2: "Basic garnishing",
    //       feature3: "Flavor combinations"
    //     },
    //     advanced: {
    //       title: "Advanced",
    //       description: "For experienced drink makers",
    //       feature1: "Complex recipes",
    //       feature2: "Advanced techniques",
    //       feature3: "Creative presentations"
    //     }
    //   },
    //   seasonalRecipes: {
    //     title: "Seasonal Recipe Collections",
    //     subtitle: "Discover recipes perfect for every season",
    //     spring: {
    //       title: "Spring",
    //       description: "Light and refreshing flavors"
    //     },
    //     summer: {
    //       title: "Summer",
    //       description: "Cool and tropical blends"
    //     },
    //     autumn: {
    //       title: "Autumn",
    //       description: "Warm and comforting flavors"
    //     },
    //     winter: {
    //       title: "Winter",
    //       description: "Rich and cozy drinks"
    //     }
    //   },
    //   communityRecipes: {
    //     title: "Community Recipes",
    //     subtitle: "Amazing recipes shared by our community",
    //     tropicalParadise: {
    //       title: "Tropical Paradise",
    //       description: "A refreshing mix of tropical fruits with a hint of coconut",
    //       by: "By Sarah M.",
    //       verified: "Verified"
    //     },
    //     berryBlast: {
    //       title: "Berry Blast",
    //       description: "A burst of mixed berries with mint and lemon",
    //       by: "By Ahmed K.",
    //       verified: "Verified"
    //     },
    //     submitYourRecipe: "Submit Your Recipe"
    //   },
    //   nutritionalInfo: {
    //     title: "Nutritional Information",
    //     subtitle: "Learn about the health benefits and nutritional content of our drinks",
    //     calorieUnit: "Calories",
    //     calorieContent: {
    //       title: "Calorie Content",
    //       plainSparklingWater: "Plain Sparkling Water",
    //       withNaturalSyrup: "With Natural Syrup",
    //       premiumSyrupMix: "Premium Syrup Mix"
    //     },
    //     healthBenefits: {
    //       title: "Health Benefits",
    //       benefit1: "Hydration without added sugars",
    //       benefit2: "Natural flavors from real ingredients",
    //       benefit3: "Low-calorie alternative to soft drinks"
    //     },
    //     allergenInfo: {
    //       title: "Allergen Information",
    //       info1: "All syrups are gluten-free",
    //       info2: "Made with natural ingredients",
    //       info3: "No artificial preservatives"
    //     }
    //   }
    // }
    // ,
    contact: {
      title: "Get in Touch",
      subtitle: "We're here to help",
      description: "Have questions about our products or need support? Reach out through any channel below.",
      phoneSupport: {
        title: "Phone Support",
        description: "Speak directly with our support team",
        hours: "Mon-Fri: 9AM-6PM (AST)"
      },
      emailSupport: {
        title: "Email Support",
        description: "Send us a detailed message",
        response: "Response within 24 hours"
      },
      officeLocation: {
        title: "Office Location",
        description: "Visit our main office",
        appointment: "By appointment only"
      },
      form: {
        title: "Send us a Message",
        subtitle: "Fill out the form and we'll respond ASAP",
        fullName: "Full Name *",
        email: "Email Address *",
        subject: "Subject *",
        message: "Message *",
        sendMessage: "Send Message",
        subjects: {
          general: "General Inquiry",
          product: "Product Question",
          support: "Technical Support",
          order: "Order Status",
          refund: "Refund Request",
          other: "Other"
        },
        placeholders: {
          fullName: "Enter your full name",
          email: "Enter your email",
          subject: "Select a subject",
          message: "How can we help you?"
        }
      },
      faq: {
        title: "Frequently Asked Questions",
        subtitle: "Common questions about our products",
        questions: {
          q1: "How does the Drinkmate work?",
          a1: "It uses CO2 to carbonate any liquid in seconds with simple button presses.",
          q2: "How long does a CO2 cylinder last?",
          a2: "A 60L cylinder carbonates approximately 60 liters of liquid.",
          q3: "Can I carbonate any drink?",
          a3: "Yes! Including juice, wine, cocktails, and more.",
          q4: "How do I refill CO2?",
          a4: "Use our exchange program or visit partner locations.",
          q5: "Are syrups natural?",
          a5: "Yes, all syrups use natural ingredients with no artificial preservatives.",
          q6: "What's the warranty?",
          a6: "2-year warranty on machines with extended options available."
        }
      },
      liveChat: {
        title: "Need Immediate Help?",
        description: "Chat with our support team in real-time",
        startChat: "Start Live Chat"
      },
      offices: {
        title: "Our Offices",
        subtitle: "Visit us in person",
        riyadh: {
          title: "Main Office - Riyadh",
          address: "King Fahd Road, Al Olaya, Riyadh",
          hours: "Mon-Fri: 9:00 AM - 6:00 PM",
          phone: "+966 50 123 4567"
        },
        jeddah: {
          title: "Service Center - Jeddah",
          address: "Prince Sultan Road, Al Hamra, Jeddah",
          hours: "Mon-Fri: 8:00 AM - 5:00 PM",
          phone: "+966 50 987 6543"
        }
      },
      testimonials: {
        title: "Customer Feedback",
        subtitle: "What our customers say",
        testimonial1: {
          text: "Excellent service! The team helped me choose the perfect soda maker.",
          author: "Ahmed S.",
          role: "Verified Customer"
        },
        testimonial2: {
          text: "Quick response time and very helpful staff. Resolved my CO2 refill issue quickly.",
          author: "Sarah M.",
          role: "Verified Customer"
        },
        testimonial3: {
          text: "Professional service with great product knowledge.",
          author: "Mohammed K.",
          role: "Verified Customer"
        }
      }
    },
    common: {
      loading: "Loading...",
      error: "An error occurred",
      success: "Success!",
      close: "Close",
      next: "Next",
      previous: "Previous",
      search: "Search",
      filter: "Filter",
      clear: "Clear",
      apply: "Apply",
      cancel: "Cancel",
      save: "Save",
      edit: "Edit",
      delete: "Delete",
      view: "View",
      add: "Add",
      remove: "Remove",
      quantity: "Quantity",
      total: "Total",
      subtotal: "Subtotal",
      shipping: "Shipping",
      tax: "Tax",
      discount: "Discount",
      checkout: "Checkout",
      continue: "Continue",
      back: "Back",
      home: "Home",
      about: "About",
      services: "Services",
      blog: "Blog",
      privacy: "Privacy",
      terms: "Terms",
      cookies: "Cookies"
    },
    footer: {
      companyDescription: "Creating perfect sparkling drinks at home with premium Italian flavors and innovative soda makers",
      phone: "+966 50 123 4567",
      email: "info@drinkmate.sa",
      address: "Riyadh, Saudi Arabia",
      products: {
        title: "Products",
        sodaMakers: "Soda Makers",
        co2Cylinders: "CO2 Cylinders",
        italianSyrups: "Italian Syrups",
        accessories: "Accessories",
        giftBundles: "Gift Bundles",
        bulkOrders: "Bulk Orders"
      },
      information: {
        title: "Information",
        supportHelp: "Support & Help",
        trackOrder: "Track Order",
        drinkRecipes: "Drink Recipes",
        blogNews: "Blog & News",
        privacyPolicy: "Privacy Policy",
        termsOfService: "Terms of Service"
      },
      newsletter: {
        title: "Stay Updated",
        description: "Get exclusive offers and product announcements",
        emailPlaceholder: "Enter your email",
        subscribeButton: "Subscribe Now",
        disclaimer: "Unsubscribe anytime. Gas cylinders not eligible for discount."
      },
      social: {
        followUs: "Follow Us:"
      },
      payment: {
        securePayment: "Secure Payment Methods"
      },
      delivery: {
        fastDelivery: "Fast Delivery"
      },
      copyright: "© 2024 Drinkmate. All rights reserved.",
      cookiePolicy: "Cookie Policy"
    }
  },
  AR: {
    header: {
      shop: "المتجر",
      co2: "ثاني أكسيد الكربون",
      recipes: "الوصفات",
      contactUs: "اتصل بنا",
      trackOrder: "تتبع الطلب",
      refillCylinder: "إعادة ملء الأسطوانة",
      refill: "إعادة ملء"
    },
    banner: {
      messages: {
          freeDelivery: "🚚 توصيل مجاني للطلبات فوق 150 ﷼",
          colaFlavors: "🥤 احصل على 3 نكهات كولا مقابل 149 ﷼ فقط استخدم الكود كولا44",
          firstOrderDiscount: "🎉 احصل على خصم 5% على أول طلب معنا استخدم الكود جديد25",
          megaOffer: "⚡ درينكميت أومني فيز يبدأ من 599 ﷼",
          cylinderRefill: "🔄 إعادة ملء أسطوانة ثاني أكسيد الكربون من 65 ﷼"
      },
      codes: {
        cola44: "كولا44",
        new25: "جديد25"
      }
    },
    home: {
      hero: {
        title: "المشروبات الغازية أصبحت بسيطة",
        subtitle: "مع درينكميت أومني فيز",
        description: "استمتع بنكهة الفراولة الإيطالية المجانية مع شراء آلة اللون الأزرق القطبي.",
        exploreMore: "استكشف المزيد",
        buyNow: "اشتر الآن"
      },
      refill: {
        title: "أعد الملء أكثر. ووفّر أكثر.",
        description: "الآن أعد ملء 4 أسطوانات معاً بسعر 55 ريال لكل أسطوانة.",
        buttonText: "أعد الملء الآن",
        offerText: "*العرض صالح طوال العام*",
        carbonatesUpto: "يضيف الغاز حتى",
        liters: "60",
        litersOfDrink: "لتر من المشروب",
        slide2: {
          headline: "احصل على مشروب الطاقة ونكهة الكولا مقابل 79 ريال",
          description: "تغلب على حرارة الصيف مع أفضل مبيعاتنا.",
          buttonText: "أعد الملء الآن"
        },
        slide3: {
          headline: "خصم 5% على أول طلب للعملاء الجدد",
          description: "تدخل عالم المشروبات الغازية؟ استمتع بخصم 5% على أول طلب مع درينكميت.",
          buttonText: "تسوق الآن"
        }
      },
      features: {
        title: "لماذا تختار درينكميت",
        subtitle: "الجودة العالية تلتقي بالتكنولوجيا المبتكرة",
        feature1: {
          title: "تغويز متعدد الاستخدامات",
          description: "أضف الغاز لأي سائل بما في ذلك العصير والنبيذ والكوكتيلات"
        },
        feature2: {
          title: "النكهات الإيطالية",
          description: "شراب إيطالي أصيل مصنوع من مكونات طبيعية"
        },
        feature3: {
          title: "صديق للبيئة",
          description: "قلل من النفايات البلاستيكية مع الزجاجات القابلة لإعادة الاستخدام"
        }
      },
      products: {
        title: "المنتجات المميزة",
        subtitle: "اكتشف أفضل منتجاتنا مبيعاً",
        viewAll: "عرض الكل"
      },
      testimonials: {
        title: "ماذا يقول عملاؤنا",
        subtitle: "تعليقات حقيقية من عملاء راضين",
        testimonial1: {
          text: "خدمة عملاء ممتازة! ساعدني الفريق في اختيار صانعة الصودا المثالية والدعم كان مذهلاً.",
          author: "أحمد س.",
          role: "عميل موثق"
        },
        testimonial2: {
          text: "وقت استجابة سريع وموظفين مفيدين جداً. حلوا مشكلة إعادة ملء ثاني أكسيد الكربون في غضون ساعات.",
          author: "سارة م.",
          role: "عميلة موثقة"
        },
        testimonial3: {
          text: "خدمة احترافية ومعرفة كبيرة بالمنتجات. إنهم يعرفون عملهم حقاً!",
          author: "محمد ك.",
          role: "عميل موثق"
        }
      },
      carousel: {
        slide1: {
          headline: "أعد الملء أكثر. ووفّر أكثر.",
          description: "الآن أعد ملء 4 أسطوانات معاً بسعر 55 ريال لكل أسطوانة.",
          buttonText: "أعد الملء الآن",
          offerText: "*العرض صالح طوال العام*",
          carbonatesUpto: "يضيف الغاز حتى",
          liters: "60",
          litersOfDrink: "لتر من المشروب"
        },
        slide2: {
          headline: "احصل على مشروب الطاقة ونكهة الكولا مقابل 79 ريال",
          description: "تغلب على حرارة الصيف مع أفضل مبيعاتنا.",
          buttonText: "أعد الملء الآن"
        },
        slide3: {
          headline: "خصم 5% على أول طلب للعملاء الجدد",
          description: "تدخل عالم المشروبات الغازية؟ استمتع بخصم 5% على أول طلب مع درينكميت.",
          buttonText: "تسوق الآن"
        }
      },
      productCategories: {
        sodaMakers: "صانعات الصودا",
        co2: "ثاني أكسيد الكربون",
        premiumItalianFlavors: "النكهات الإيطالية عالية الجودة",
        accessories: "الملحقات"
      },
      megaOffer: {
        title: "درينكميت أومني فيز",
        description: "على عكس صانعات الصودا التقليدية، تسمح لك درينكميت أومني فيز بإضافة الغاز لأي مشروب بسهولة، من العصير والشاي المثلج إلى النبيذ والكوكتيلات، مما يوفر إمكانيات لا تنتهي للمشروبات الغازية المنعشة.",
        availableColors: "خيارات الألوان المتاحة",
        offersBundles: "العروض والباقات",
        exploreMore: "استكشف المزيد"
      },
      howItWorks: {
        title: "كيف تعمل درينكميت أومني فيز؟",
        subtitle: "ثلاث خطوات بسيطة توضح لك كيفية استخدام درينكميت أومني فيز"
      },
      co2Section: {
        litersOfDrinks: "لتر من المشروبات",
        description: "مع برنامج تبادل ثاني أكسيد الكربون من درينكميت، أعد الأسطوانات الفارغة واحصل على خصم على مشترياتك القادمة من ثاني أكسيد الكربون. سهل ومستدام وجاهز للفوران—دائماً.",
        descriptionAr: "مع برنامج تبادل ثاني أكسيد الكربون من Drinkmate، أرسل الأسطوانات الفارغة واحصل على خصم على مشترياتك القادمة من ثاني أكسيد الكربون. سهل ومستدام وجاهز للفوران—دائماً.",
        learnMore: "اعرف المزيد",
        learnMoreAr: "اعرف المزيد",
        exploreSubscriptions: "استكشف الاشتراكات",
        exploreSubscriptionsAr: "استكشف الاشتراكات",
        benefits: {
          easyExchange: "تبادل سهل للأسطوانات",
          easyExchangeAr: "تبادل سهل للأسطوانات",
          sustainable: "مستدام وصديق للبيئة",
          sustainableAr: "مستدام وصديق للبيئة",
          fizzReady: "دائماً جاهز للفوران",
          fizzReadyAr: "دائماً جاهز للفوران"
        }
      },
      flavorSection: {
        subtitle: "لا تضيف الغاز للماء فقط",
        title: "أضف الغاز لأي شيء",
        description: "اكتشف نكهاتنا الإيطالية عالية الجودة وأنشئ مشروبات غازية مذهلة في المنزل. من الكولا الكلاسيكي إلى تركيبات الفواكه الغريبة، الإمكانيات لا تنتهي!",
        exploreFlavors: "استكشف النكهات"
      },
      additionalSections: {
        howToUse: {
          title: "كيفية الاستخدام",
          description: "تعلم كيفية صنع مشروبات مثالية في كل مرة باستخدام شرابات درينكميت الإيطالية عالية الجودة."
        },
        recipes: {
          title: "الوصفات",
          description: "مشروبات منزلية الصنع مصممة خصيصاً لك لتجربتها والاستمتاع بها."
        },
        premiumFlavors: {
          title: "النكهات الإيطالية عالية الجودة",
          description: "اعرف وجرب جميع نكهاتنا الطبيعية الـ 22 الخالية من السكر عالية الجودة."
        }
      },
      environmental: {
        subtitle: "اعرف المزيد عن جهود درينكميت من أجل",
        title: "بيئة أكثر خضرة وأفضل",
        plasticImpact: "تأثيرنا على استخدام البلاستيك لمرة واحدة",
        naturalFlavors: "كيف تُصنع نكهاتنا الطبيعية",
        healthBenefits: "الفوائد الصحية للمياه الغازية"
      }
    },
    shop: {
      title: "تسوق منتجاتنا",
      subtitle: "صانعات الصودا عالية الجودة والنكهات الإيطالية الأصيلة",
      description: "اكتشف مجموعتنا الكاملة من صانعات الصودا وأسطوانات ثاني أكسيد الكربون والشرابات الإيطالية عالية الجودة والملحقات. كل ما تحتاجه لإنشاء مشروبات غازية مثالية في المنزل.",
      hero: {
        title: "تسوق",
        subtitle: "منتجاتنا",
        description: "اكتشف مجموعتنا الكاملة من صانعات الصودا وأسطوانات ثاني أكسيد الكربون والشرابات الإيطالية عالية الجودة والملحقات. كل ما تحتاجه لإنشاء مشروبات غازية مثالية في المنزل."
      },
      refill: {
        title: "أعد الملء أكثر. ووفّر أكثر.",
        description: "الآن أعد ملء 4 أسطوانات معاً بسعر 55 ريال لكل أسطوانة.",
        buttonText: "أعد الملء الآن",
        offerText: "*العرض صالح طوال العام*",
        carbonatesUpto: "يضيف الغاز حتى",
        liters: "60",
        litersOfDrink: "لتر من المشروب",
        slide2: {
          headline: "احصل على مشروب الطاقة ونكهة الكولا مقابل 79 ريال",
          description: "تغلب على حرارة الصيف مع أفضل مبيعاتنا.",
          buttonText: "أعد الملء الآن"
        },
        slide3: {
          headline: "خصم 5% على أول طلب للعملاء الجدد",
          description: "تدخل عالم المشروبات الغازية؟ استمتع بخصم 5% على أول طلب مع درينكميت.",
          buttonText: "تسوق الآن"
        }
      },
      bundles: {
        title: "الباقات",
        subtitle: "عالية الجودة",
        description: "اكتشف باقاتنا المدروسة بعناية والمصممة لإعطائك تجربة درينكميت المثالية. وفر الكثير مع الحصول على كل ما تحتاجه في حزمة مثالية واحدة.",
        starterKit: "طقم البداية",
        familyPack: "طقم العائلة",
        premiumBundle: "الباقة المميزة",
        starterKitDescription: "كل ما تحتاجه للبدء مع درينكميت.",
        familyPackDescription: "مثالي للعائلات التي ترغب في تغذية مشروباتها.",
        premiumBundleDescription: "تجربة درينكميت المثالية، كل شيء في حزمة واحدة.",
        starterKitItems: "1 درينكميت أومني فيز، 1 أسطوانة ثاني أكسيد الكربون، 1 زجاجة شراب الفراولة والليمون",
        familyPackItems: "2 درينكميت أومني فيز، 2 أسطوانة ثاني أكسيد الكربون، 2 حزمة نكهات إيطالية عالية الجودة، 1 مجموعة زجاجات",
        premiumBundleItems: "3 درينكميت أومني فيز، 3 أسطوانة ثاني أكسيد الكربون، 3 حزمة نكهات إيطالية عالية الجودة، 1 مجموعة زجاجات، 1 حزمة نكهات الكولا الطاقة",
        includes: "يتضمن:",
        save: "وفر",
        shopNow: "تسوق الآن",
        getPopularBundle: "🔥 احصل على الباقة الشائعة",
        limitedTimeOffer: "⚡ عرض لفترة محدودة",
        bestSeller: "🔥 الأكثر مبيعاً",
        mostPopular: "⭐ الأكثر شعبية",
        limitedTimeOfferText: "عرض لفترة محدودة"
      },
      filters: {
        all: "الكل",
        machines: "صانعات الصودا",
        flavors: "النكهات الإيطالية",
        accessories: "الملحقات",
        showing: "عرض",
        products: "منتج",
        sortBy: "ترتيب حسب:",
        featured: "مميز",
        priceLowToHigh: "السعر: من الأقل إلى الأعلى",
        priceHighToLow: "السعر: من الأعلى إلى الأقل",
        highestRated: "الأعلى تقييماً",
        newest: "الأحدث",
        loadMore: "تحميل المزيد من المنتجات"
      },
      products: {
        addToCart: "أضف إلى السلة",
        outOfStock: "نفذت الكمية",
        new: "🆕 جديد",
        popular: "⭐ شائع",
        discount: "💥",
        verified: "موثق",
        reviews: "تقييم",
        rating: "تقييم",
        productNames: {
          drinkmateRed: "درينكميت أومني فيز اللون الأحمر",
          drinkmateBlue: "درينكميت أومني فيز اللون الأزرق",
          drinkmateBlack: "درينكميت أومني فيز اللون الأسود",
          co2Cylinder: "أسطوانة ثاني أكسيد الكربون",
          strawberryLemonSyrup: "شراب الفراولة والليمون",
          premiumFlavorsPack: "حزمة نكهات إيطالية عالية الجودة",
          bottlesSet: "مجموعة زجاجات",
          energyColaFlavors: "حزمة نكهات الكولا الطاقة"
        },
        categories: {
          sodaMakers: "صانعات الصودا",
          co2: "ثاني أكسيد الكربون",
          italianFlavors: "النكهات الإيطالية",
          accessories: "الملحقات"
        }
      },
      customerReviews: {
        title: "ماذا يقول",
        subtitle: "عملاؤنا",
        description: "تقييمات حقيقية من مستخدمي درينكميت الراضين في جميع أنحاء العالم",
        joinCustomers: "انضم إلى أكثر من 10,000 عميل سعيد",
        experienceDifference: "اختبر فرق درينكميت اليوم!",
        verified: "موثق",
        reviews: {
          sarah: {
            name: "سارة المنصوري",
            location: "الرياض، المملكة العربية السعودية",
            review: "أحب آلة درينكميت أومني فيز! النكهات الإيطالية مذهلة والآلة سهلة الاستخدام جداً. أطفالي يحبون صنع مشروباتهم الغازية الخاصة. أفضل شراء على الإطلاق!",
            date: "قبل أسبوعين"
          },
          ahmed: {
            name: "أحمد حسن",
            location: "جدة، المملكة العربية السعودية",
            review: "مثالية لاستضافة الحفلات! الجميع مندهش من جودة المشروبات الغازية التي يمكننا صنعها في المنزل. برنامج تبادل ثاني أكسيد الكربون مريح جداً وفعال من حيث التكلفة.",
            date: "قبل شهر"
          },
          fatima: {
            name: "فاطمة الزهراء",
            location: "الدمام، المملكة العربية السعودية",
            review: "النكهات الإيطالية عالية الجودة إلهية تماماً! جربت جميع النكهات الـ 22 وكل واحدة أفضل من السابقة. الآلة متينة وخدمة العملاء استثنائية.",
            date: "قبل 3 أسابيع"
          },
          omar: {
            name: "عمر خليل",
            location: "أبها، المملكة العربية السعودية",
            review: "استثمار رائع للأشخاص المهتمين بالصحة. قللنا من استهلاك الصودا بشكل كبير والآن نستمتع بالمشروبات الغازية الطبيعية. طقم البداية كان مثالياً للمبتدئين.",
            date: "قبل شهر"
          },
          layla: {
            name: "ليلى الرشيد",
            location: "تبوك، المملكة العربية السعودية",
            review: "باقة العائلة قيمة مذهلة! نستخدمها يومياً والجودة لا تخيب أبداً. الآلة مصممة لتدوم والنكهات بجودة المطاعم. أوصي بها بشدة!",
            date: "قبل شهرين"
          },
          youssef: {
            name: "يوسف المحمود",
            location: "الخبر، المملكة العربية السعودية",
            review: "منتج وخدمة ممتازة! أسطوانات ثاني أكسيد الكربون تدوم أطول من المتوقع والنكهات إيطالية أصيلة. مثالي لصنع الكوكتيلات والمشروبات المنعشة في المنزل.",
            date: "قبل 3 أسابيع"
          }
        }
      },
      promotional: {
        limitedTimeOffer: "عرض لفترة محدودة",
        saveUpTo: "وفر حتى",
        selectedItems: "على العناصر المختارة",
        dontMissOut: "لا تفوت هذه العروض المذهلة - تسوق الآن قبل أن تنتهي!",
        shopDeals: "🚀 تسوق العروض",
        shopNow: "تسوق الآن",
        limitedTimeOfferText: "عرض لفترة محدودة"
      },
      productDetail: {
        breadcrumb: {
          shop: "المتجر",
          category: "فئة المنتج",
          product: "اسم المنتج"
        },
        badges: {
          new: "جديد",
          popular: "شائع",
          discount: "خصم",
          lowStock: "المخزون منخفض"
        },
        imageCounter: {
          of: "من"
        },
        rating: {
          outOf5: "5 من 5",
          reviews: "تقييمات",
          verifiedPurchase: "تم الشراء بالفعل",
          basedOn: "مبني على",
          verifiedReviews: "تقييمات موثقة",
          helpful: "مفيد",
          reply: "رد"
        },
        options: {
          availableColors: "الألوان المتاحة",
          availableSizes: "الأحجام المتاحة",
          quantity: "الكمية"
        },
        actions: {
          addToCart: "أضف إلى السلة",
          outOfStock: "نفذت الكمية",
          addToWishlist: "أضف إلى المفضلة",
          addBundleToCart: "أضف الحزمة للسلة",
          addedToCart: "تمت الإضافة إلى السلة",
          removeFromWishlist: "إزالة من المفضلة"
        },
        features: {
          keyFeatures: "ميزات المنتج",
          bundleBenefits: "فوائد الحزمة",
          whatsIncluded: "ما يشمل"
        },
        trust: {
          freeShipping: "شحن مجاني",
          warranty: "ضمان",
          easyReturns: "إرجاع سهل",
          twoYearWarranty: "ضمان سنتين"
        },
        tabs: {
          productInformation: "معلومات المنتج",
          completeDetails: "التفاصيل الكاملة",
          productDescription: "وصف المنتج",
          technicalSpecifications: "التفاصيل الفنية",
          customerReviews: "تقييمات العملاء",
          bundleSpecifications: "التفاصيل المتعلقة بالحزمة",
          outOf5: "من 5",
          basedOn: "بناءً على",
          verified: "موثق"
        },
        related: {
          youMightAlsoLike: "ربما تحب أيضاً",
          products: {
            drinkmateRed: "درينكميت - آلة أومني فيز - حمراء",
            co2Cylinder: "أسطوانة ثاني أكسيد الكربون 60 لتر",
            strawberryLemon: "شراب الفراولة والليمون الإيطالي"
          },
          categories: {
            sodaMakers: "صانعات الصودا",
            co2: "ثاني أكسيد الكربون",
            italianFlavors: "النكهات الإيطالية"
          }
        },
        products: {
          names: {
            drinkmateRed: "درينكميت - آلة أومني فيز - حمراء",
            drinkmateBlue: "درينكميت - آلة أومني فيز - زرقاء",
            drinkmateBlack: "درينكميت - آلة أومني فيز - سوداء",
            co2Cylinder: "أسطوانة ثاني أكسيد الكربون 60 لتر",
            strawberryLemonSyrup: "شراب الفراولة والليمون الإيطالي",
            premiumFlavorsPack: "باقة النكهات الإيطالية المميزة",
            bottlesSet: "طقم زجاجات درينكميت",
            energyColaFlavors: "نكهات الكولا المنشطة"
          },
          categories: {
            sodaMakers: "صانعات الصودا",
            co2: "ثاني أكسيد الكربون",
            italianFlavors: "النكهات الإيطالية",
            accessories: "الملحقات"
          },
          descriptions: {
            drinkmateRed: "درينكميت أومني فيز الحمراء هي صانعة صودا ثورية تسمح لك بإضافة الغاز لأي سائل، وليس فقط الماء. من العصير والشاي المثلج إلى النبيذ والكوكتيلات، الاحتمالات لا تنتهي. هذا النموذج الأحمر المميز يجمع بين الأناقة والوظائف، ويتميز بتقنية إضافة الغاز المتقدمة وتصميم أنيق يكمل أي مطبخ.",
            drinkmateBlue: "يقدم درينكميت أومني فيز الأزرق نفس تقنية إضافة الغاز الثورية في لون أزرق مذهل. مثالي لأولئك الذين يفضلون الجمالية الأكثر برودة وعصرية مع الاستمتاع بجميع فوائد صنع الصودا بجودة احترافية في المنزل.",
            drinkmateBlack: "يجمع درينكميت أومني فيز الأسود بين الأناقة والوظائف. هذا النموذج الأسود الأنيق يقدم نفس تقنية إضافة الغاز المتقدمة في تصميم متطور يناسب تماماً أي مطبخ عصري.",
            co2Cylinder: "أسطوانة ثاني أكسيد كربون عالية الجودة توفر حتى 60 لتر من المشروبات الغازية. متوافقة مع جميع آلات درينكميت ومصممة للتشغيل الآمن والموثوق. مثالية للاستخدام المنزلي والاجتماعات الصغيرة.",
            strawberryLemonSyrup: "شراب الفراولة والليمون الإيطالي الأصيل المصنوع من مكونات مميزة. هذا المزيج اللذيذ يخلق مشروب غازي منعش وفواكه مثالي لأي مناسبة. مصنوع في إيطاليا باستخدام وصفات تقليدية.",
            premiumFlavorsPack: "مجموعة مميزة من الشرابات الإيطالية الأصيلة التي تتميز بأفضل النكهات من إيطاليا. تتضمن هذه الباقة مجموعة متنوعة من النكهات الكلاسيكية والغريبة، مثالية لإنشاء مشروبات غازية بجودة المطاعم في المنزل.",
            bottlesSet: "طقم كامل من الزجاجات عالية الجودة المصممة خصيصاً لآلات درينكميت. هذه الزجاجات مصنوعة من مواد آمنة للأغذية وتتميز بختم آمن للحفاظ على الغاز. مثالية لتخزين وتقديم مشروباتك الغازية محلية الصنع.",
            energyColaFlavors: "نكهة كولا منشطة مع لمسة فريدة. هذا الشراب مستوحى من الكولا الإيطالية يجمع بين طعم الكولا الكلاسيكي والمكونات الطبيعية المعززة للطاقة، مما يخلق مشروب غازي منعش ومنشط."
          },
          specifications: {
            dimensions: "الأبعاد",
            weight: "الوزن",
            material: "المادة",
            powerSource: "مصدر الطاقة",
            capacity: "السعة",
            co2Compatibility: "توافق ثاني أكسيد الكربون",
            warranty: "الضمان",
            countryOfOrigin: "بلد المنشأ",
            volume: "الحجم",
            ingredients: "المكونات",
            origin: "المنشأ",
            allergens: "مسببات الحساسية",
            shelfLife: "مدة الصلاحية",
            storage: "التخزين",
            serving: "الخدمة",
            certification: "الشهادة",
            contents: "المحتويات",
            totalVolume: "الحجم الإجمالي",
            sealType: "نوع الختم",
            dishwasherSafe: "آمن لغسالة الصحون",
            bpaFree: "خالي من BPA",
            safety: "السلامة",
            compatibility: "التوافق",
            refillable: "قابل لإعادة الملء"
          },
          specificationValues: {
            dimensions: "12.5\" × 8.5\" × 15.5\"",
            weight: "4.2 رطل",
            material: "بلاستيك آمن للأغذية وفولاذ مقاوم للصدأ",
            powerSource: "تشغيل يدوي",
            capacity: "زجاجات 1 لتر",
            co2Compatibility: "أسطوانات 60 لتر قياسية",
            warranty: "ضمان محدود لمدة عامين",
            countryOfOrigin: "إيطاليا",
            volume: "500 مل",
            ingredients: "فراولة طبيعية، ليمون، سكر، ماء",
            origin: "إيطاليا",
            allergens: "لا شيء",
            shelfLife: "24 شهراً غير مفتوح",
            storage: "تخزين في مكان بارد وجاف",
            serving: "يصنع 10-15 مشروب",
            certification: "حلال معتمد",
            contents: "4 زجاجات مع أغطية",
            totalVolume: "4 لترات",
            sealType: "غطاء برغي مع حشية",
            dishwasherSafe: "نعم",
            bpaFree: "نعم",
            safety: "صمام أمان مدمج",
            compatibility: "جميع آلات درينكميت",
            refillable: "نعم، من خلال برنامج التبادل"
          },
          features: {
            carbonatesAnyLiquid: "يضيف الغاز لأي سائل في ثوانٍ",
            advancedPressureRelease: "نظام إطلاق الضغط المتقدم",
            ergonomicDesign: "تصميم مريح للاستخدام السهل",
            foodGradeMaterials: "مواد آمنة للأغذية للسلامة",
            compatibleWithCo2: "متوافق مع جميع أسطوانات ثاني أكسيد الكربون القياسية",
            easyToClean: "مكونات سهلة التنظيف",
            portableLightweight: "محمولة وخفيفة الوزن",
            noElectricityRequired: "لا تحتاج كهرباء",
            highGradeSteel: "بناء من الفولاذ عالي الجودة",
            builtInSafetyValve: "صمام أمان مدمج",
            refillableExchange: "قابلة لإعادة الملء من خلال برنامج التبادل",
            longLastingPerformance: "أداء طويل الأمد",
            authenticItalianRecipe: "وصفة إيطالية أصلية",
            naturalIngredients: "مكونات طبيعية",
            perfectBalance: "توازن مثالي بين الفراولة والليمون",
            makesDrinks: "يصنع 10-15 مشروب منعش",
            halalCertified: "حلال معتمد",
            longShelfLife: "مدة صلاحية طويلة",
            noArtificialPreservatives: "لا تحتوي على مواد حافظة اصطناعية",
            versatileDrinks: "متعددة الاستخدامات لمشروبات مختلفة",
            premiumCollection: "8 شرابات إيطالية مميزة",
            varietyFlavors: "تنوع في النكهات الكلاسيكية",
            restaurantQuality: "طعم بجودة المطاعم",
            greatValuePack: "باقة قيمة ممتازة",
            completeSet: "4 زجاجات مع أغطية آمنة",
            secureSeal: "ختم آمن يحافظ على الغاز",
            perfectStorage: "مثالية للتخزين والتقديم",
            classicCola: "طعم الكولا الكلاسيكي",
            naturalEnergy: "تعزيز طبيعي للطاقة",
            refreshingTaste: "طعم منعش"
          },
          colors: {
            red: "أحمر",
            blue: "أزرق",
            black: "أسود",
            silver: "فضي",
            clear: "شفاف",
            brown: "بني",
            mixed: "مختلط"
          },
          sizes: {
            standard: "قياسي",
            sixtyLiters: "60 لتر",
            fiveHundredMl: "500 مل",
            oneLiterX4: "1 لتر × 4",
            eightX500ml: "8×500 مل"
          },
          currency: {
            sar: "ريال",
            save: "وفر"
          },
          reviews: {
            sarahAlMansouri: "سارة المنصوري",
            ahmedHassan: "أحمد حسن",
            fatimaZahra: "فاطمة الزهراء",
            riyadhSaudiArabia: "الرياض، المملكة العربية السعودية",
            jeddahSaudiArabia: "جدة، المملكة العربية السعودية",
            dammamSaudiArabia: "الدمام، المملكة العربية السعودية",
            twoWeeksAgo: "قبل أسبوعين",
            oneMonthAgo: "قبل شهر",
            threeWeeksAgo: "قبل 3 أسابيع",
            sarahReview: "أحب آلة درينكميت أومني فيز! النكهات الإيطالية مذهلة والآلة سهلة الاستخدام جداً. أطفالي يحبون صنع مشروباتهم الغازية الخاصة. أفضل شراء على الإطلاق!",
            ahmedReview: "مثالية لاستضافة الحفلات! الجميع مندهش من جودة المشروبات الغازية التي يمكننا صنعها في المنزل. برنامج تبادل ثاني أكسيد الكربون مريح جداً وفعال من حيث التكلفة.",
            fatimaReview: "آلة رائعة بشكل عام! اللون الأحمر جميل وتعمل بشكل مثالي. أعطي 4 نجوم فقط لأن دليل التعليمات يمكن أن يكون أوضح للمستخدمين لأول مرة."
          }
        },
        bundleDetail: {
          whatsIncluded: "ما يشمل",
          quantity: "الكمية",
          addBundleToCart: "أضف الحزمة إلى السلة",
          addToWishlist: "أضف إلى قائمة الأمنيات",
          bundleBenefits: "فوائد الحزمة",
          bundleSpecifications: "تفاصيل الحزمة",
          save: "وفر",
          bundles: "الباقات",
          mostPopular: "الأكثر شعبية",
          addedToCart: "تمت الإضافة إلى السلة",
          removeFromWishlist: "إزالة من قائمة الأمنيات",
          addedToWishlist: "تمت الإضافة إلى قائمة الأمنيات",
          familyBundle: {
            title: "إعداد كامل للعائلة مع نكهات متعددة",
            description: "باقة عائلية مثالية مع كل ما تحتاجه لبدء صنع المشروبات الغازية في المنزل",
            items: "x1 صانعة صودا، x2 أسطوانة و x5 Flavors",
            features: [
              "إعداد كامل لصانعة الصودا",
              "أسطوانات ثاني أكسيد كربون متعددة للاستخدام الممتد",
              "تنوع في النكهات الإيطالية المميزة",
              "مثالية للاجتماعات العائلية",
              "قيمة ممتازة مقابل المال",
              "سهلة الاستخدام والصيانة"
            ],
            specifications: {
              "صانعة الصودا": "درينكميت أومني فيز (أزرق)",
              "أسطوانات ثاني أكسيد الكربون": "2x أسطوانة 60 لتر",
              "النكهات المدرجة": "5 شراب إيطالي مميز",
              "القيمة الإجمالية": "999.00 ريال سعودي",
              "توفير الباقة": "200.00 ريال سعودي",
              "الضمان": "سنتان على الآلة، سنة واحدة على الملحقات"
            }
          },
          starterBundle: {
            title: "طقم البداية",
            description: "طقم مثالي لأولئك الذين يستخدمون الآلة لأول مرة",
            items: "x1 صانعة صودا، x1 أسطوانة و x2 نكهات",
            features: [
              "إعداد كامل للمبتدئين",
              "مثالي للمبتدئين",
              "نكهتان إيطاليتان مميزتان مدرجتان",
              "سهل الاستخدام والصيانة",
              "قيمة ممتازة مقابل المال",
              "كل ما تحتاجه للبدء"
            ],
            specifications: {
              "صانعة الصودا": "درينكميت أومني فيز (هيرو)",
              "أسطوانات ثاني أكسيد الكربون": "1x أسطوانة 60 لتر",
              "النكهات المدرجة": "2 شراب إيطالي مميز",
              "القيمة الإجمالية": "899.00 ريال سعودي",
              "توفير الباقة": "100.00 ريال سعودي",
              "الضمان": "سنتان على الآلة، سنة واحدة على الملحقات"
            }
          },
          premiumBundle: {
            title: "الباقة المميزة",
            description: "تجربة فاخرة مع نكهات إيطالية مميزة",
            items: "x1 صانعة صودا، x1 أسطوانة و x8 نكهات مميزة",
            features: [
              "إعداد صانعة صودا مميزة",
              "8 نكهات إيطالية مميزة",
              "تجربة فاخرة",
              "مثالية للترفيه",
              "نكهات بجودة المطاعم",
              "باقة القيمة القصوى"
            ],
            specifications: {
              "صانعة الصودا": "درينكميت أومني فيز (حمراء)",
              "أسطوانات ثاني أكسيد الكربون": "1x أسطوانة 60 لتر",
              "النكهات المدرجة": "8 شراب إيطالي مميز",
              "القيمة الإجمالية": "1,499.00 ريال سعودي",
              "توفير الباقة": "200.00 ريال سعودي",
              "الضمان": "سنتان على الآلة، سنة واحدة على الملحقات"
            }
          },
          features: {
            completeSetup: "إعداد كامل لصانعة الصودا",
            multipleCylinders: "أسطوانات ثاني أكسيد كربون متعددة للاستخدام الممتد",
            varietyFlavors: "تنوع في النكهات الإيطالية المميزة",
            familyGatherings: "مثالية للاجتماعات العائلية",
            greatValue: "قيمة ممتازة مقابل المال",
            easyUse: "سهلة الاستخدام والصيانة"
          },
          specifications: {
            sodaMaker: "صانعة الصودا",
            co2Cylinders: "أسطوانات ثاني أكسيد الكربون",
            flavorsIncluded: "النكهات المدرجة",
            totalValue: "القيمة الإجمالية",
            bundleSavings: "توفير الباقة",
            warranty: "الضمان",
            // Starter bundle specific values
            starterSodaMaker: "درينكميت أومني فيز (هيرو)",
            starterCo2Cylinders: "أسطوانة 1× 60 لتر",
            starterFlavors: "2 شراب إيطالي عالي الجودة",
            starterTotalValue: "899.00 ريال",
            starterBundleSavings: "100.00 ريال",
            starterWarranty: "سنتان على الآلة، سنة واحدة على الملحقات",
            // Family bundle specific values
            familySodaMaker: "درينكميت أومني فيز (أزرق)",
            familyCo2Cylinders: "أسطوانتان 2× 60 لتر",
            familyFlavors: "5 شراب إيطالي عالي الجودة",
            familyTotalValue: "1,199.00 ريال",
            familyBundleSavings: "200.00 ريال",
            familyWarranty: "سنتان على الآلة، سنة واحدة على الملحقات",
            // Premium bundle specific values
            premiumSodaMaker: "درينكميت أومني فيز (أحمر)",
            premiumCo2Cylinders: "أسطوانة 1× 60 لتر",
            premiumFlavors: "8 شراب إيطالي عالي الجودة",
            premiumTotalValue: "1,499.00 ريال",
            premiumBundleSavings: "200.00 ريال",
            premiumWarranty: "سنتان على الآلة، سنة واحدة على الملحقات"
          }
        }
      }
    },
    trackOrder: {
      hero: {
        title: "تتبع طلبك",
        subtitle: "ابق محدثاً على طلب درينكميت مع التتبع في الوقت الفعلي. أدخل رقم الطلب والبريد الإلكتروني للحصول على تحديثات مفصلة للحالة."
      },
      form: {
        title: "تتبع طلبك",
        subtitle: "أدخل تفاصيل طلبك للحصول على تحديثات في الوقت الفعلي",
        orderNumber: "رقم الطلب *",
        orderNumberPlaceholder: "مثال: ORD-2024-001",
        email: "عنوان البريد الإلكتروني *",
        emailPlaceholder: "أدخل بريدك الإلكتروني",
        trackOrder: "تتبع الطلب"
      },
      results: {
        title: "حالة الطلب",
        orderNumber: "الطلب رقم",
        currentStatus: "الحالة الحالية",
        estimatedDelivery: "موعد التسليم المتوقع",
        currentLocation: "الموقع الحالي",
        trackingHistory: "تاريخ التتبع"
      },
      recentOrders: {
        title: "الطلبات الحديثة",
        subtitle: "وصول سريع لتاريخ طلباتك",
        orderDate: "تاريخ الطلب",
        items: "العناصر",
        total: "المجموع",
        trackThisOrder: "تتبع هذا الطلب"
      },
      orderHistory: {
        title: "تاريخ الطلبات",
        subtitle: "عرض وإدارة جميع طلباتك السابقة",
        allOrders: "جميع الطلبات",
        viewAllOrders: "عرض جميع الطلبات",
        orderId: "معرف الطلب",
        date: "التاريخ",
        status: "الحالة",
        total: "المجموع",
        actions: "الإجراءات",
        track: "تتبع"
      },
      delivery: {
        title: "التوصيل والشحن",
        subtitle: "كل ما تحتاج لمعرفته عن التوصيل",
        standardDelivery: "التوصيل القياسي",
        standardDeliveryTime: "3-5 أيام عمل",
        standardDeliveryNote: "مجاني للطلبات فوق 150 ريال",
        expressDelivery: "التوصيل السريع",
        expressDeliveryTime: "1-2 يوم عمل",
        expressDeliveryNote: "رسوم إضافية تنطبق",
        localPickup: "الاستلام المحلي",
        localPickupTime: "متاح في نفس اليوم",
        localPickupNote: "من مكتبنا في الرياض"
      },
      returns: {
        title: "سياسة الإرجاع والتبديل",
        subtitle: "إرجاع وتبديل بدون متاعب",
        returnPolicy: "سياسة الإرجاع",
        returnPolicyItems: {
          item1: "نافذة إرجاع 30 يوماً لمعظم المنتجات",
          item2: "يجب أن تكون العناصر في حالتها الأصلية",
          item3: "شحن إرجاع مجاني",
          item4: "استرداد كامل أو تبديل"
        },
        exchangePolicy: "سياسة التبديل",
        exchangePolicyItems: {
          item1: "تبديل الحجم أو اللون متاح",
          item2: "استبدال المنتج المعيب",
          item3: "برنامج تبادل أسطوانات ثاني أكسيد الكربون",
          item4: "لا توجد رسوم إعادة تخزين"
        }
      },
      notifications: {
        title: "ابق محدثاً",
        subtitle: "احصل على إشعارات التوصيل في الوقت الفعلي",
        deliveryNotifications: "إشعارات التوصيل",
        description: "لا تفوت تحديث التوصيل أبداً! سنرسل لك إشعارات في كل خطوة من رحلة طلبك.",
        items: {
          item1: "تأكيد الطلب",
          item2: "تحديثات الشحن",
          item3: "تنبيهات التسليم",
          item4: "تتبع في الوقت الفعلي"
        },
        enableNotifications: "تفعيل الإشعارات",
        learnMore: "اعرف المزيد",
        getNotified: "احصل على إشعارات في كل خطوة"
      },
      status: {
        orderPlaced: "تم تقديم الطلب",
        processing: "قيد المعالجة",
        shipped: "تم الشحن",
        inTransit: "قيد النقل",
        delivered: "تم التسليم"
      },
      help: {
        title: "تحتاج مساعدة مع طلبك؟",
        subtitle: "فريق دعم العملاء لدينا هنا لمساعدتك في أي أسئلة حول طلب درينكميت الخاص بك.",
        callUs: "اتصل بنا",
        callUsNumber: "+966 11 234 5678",
        callUsNote: "متاح من الأحد إلى الخميس، 9:00 صباحاً - 6:00 مساءً (توقيت الرياض)",
        emailUs: "راسلنا",
        emailUsAddress: "support@drinkmate.sa",
        emailUsNote: "سنرد خلال 24 ساعة في أيام العمل"
      }
    },
    blog: {
      hero: {
        title: "المدونة والأخبار",
        subtitle: "ابق محدثاً",
        description: "اكتشف أحدث الأخبار والنصائح والرؤى حول منتجات درينكميت وعالم المشروبات الغازية."
      },
      featuredPost: {
        title: "المقال المميز",
        readMore: "اقرأ المزيد",
        publishedOn: "نشر في",
        author: "بواسطة",
        category: "الفئة"
      },
      categories: {
        all: "الكل",
        news: "الأخبار",
        tips: "النصائح والحيل",
        recipes: "الوصفات",
        company: "الشركة",
        science: "العلوم",
        guide: "الدليل",
        products: "المنتجات",
        environment: "البيئة",
        health: "الصحة",
        lifestyle: "نمط الحياة"
      },
      search: {
        placeholder: "البحث في المقالات...",
        searchButton: "بحث"
      },
      newsletter: {
        title: "ابق محدثاً",
        description: "احصل على أحدث المقالات والأخبار في بريدك الإلكتروني",
        emailPlaceholder: "أدخل بريدك الإلكتروني",
        subscribe: "اشتراك"
      },
              pagination: {
          previous: "السابق",
          next: "التالي",
          page: "الصفحة",
          of: "من"
        },
        blogPosts: {
          readTime: "دقائق للقراءة",
          publishedOn: "نُشر في",
          author: "الكاتب",
          category: "الفئة",
          backToBlog: "العودة إلى المدونة",
          shareThisPost: "شارك هذا المنشور",
          relatedPosts: "منشورات ذات صلة",
          tags: "العلامات",
          comments: "التعليقات",
          leaveComment: "اترك تعليقاً",
          commentPlaceholder: "اكتب تعليقك هنا...",
          postComment: "نشر التعليق",
          likePost: "إعجاب",
          likedPost: "أعجبني",
          // Blog post content translations
          postTitles: {
            post1: "10 وصفات مشروبات منعشة للصيف مع درينكميت",
            post2: "العلم وراء التكربن المثالي",
            post3: "كيف تختار أسطوانة ثاني أكسيد الكربون المثالية لدرينكميت",
            post4: "أفضل 5 شرابات إيطالية فاخرة لدرينكميت",
            post5: "التأثير البيئي: كيف يقلل درينكميت من النفايات البلاستيكية",
            post6: "الفوائد الصحية للمياه الغازية: الخرافات مقابل الحقائق",
            post7: "كيف تستضيف حفلة التكربن المثالية مع درينكميت"
          },
          postExcerpts: {
            post1: "تغلب على حرارة الصيف مع وصفات المشروبات الغازية اللذيذة والسهلة الصنع باستخدام آلة درينكميت.",
            post2: "تعلم عن كيمياء التكربن وكيف تنشئ تقنية درينكميت الفقاعات المثالية في كل مرة.",
            post3: "تعلم كيف تختار الحجم المثالي لأسطوانة ثاني أكسيد الكربون لآلة درينكميت بناءً على الاستخدام والتكلفة والراحة.",
            post4: "اكتشف أفضل 5 شرابات إيطالية فاخرة ستغير مشروبات درينكميت إلى متعة إيطالية أصيلة.",
            post5: "اكتشف كيف تساعد آلة درينكميت في تقليل النفايات البلاستيكية وحماية البيئة مع توفير المال.",
            post6: "اكتشف الحقيقة حول الفوائد الصحية للمياه الغازية ودحض الخرافات الشائعة بالأدلة العلمية.",
            post7: "تعلم كيف تستضيف حفلة تكربن لا تُنسى ستعرض آلة درينكميت وتثير إعجاب ضيوفك."
          },
          postAuthors: {
            drinkmateTeam: "فريق درينكميت",
            ahmedHassan: "د. أحمد حسن",
            sarahJohnson: "د. سارة جونسون",
            environmentalTeam: "فريق البيئة"
          },
          postDates: {
            jan15: "15 يناير 2024",
            jan12: "12 يناير 2024",
            jan10: "10 يناير 2024",
            jan8: "8 يناير 2024",
            jan5: "5 يناير 2024",
            jan3: "3 يناير 2024",
            dec30: "30 ديسمبر 2023"
          },
          post1: {
            title: "10 وصفات مشروبات منعشة للصيف مع درينكميت",
            subtitle: "تغلب على حرارة الصيف مع المشروبات الغازية محلية الصنع!",
            intro: "الصيف هنا، وما أفضل طريقة للتغلب على الحرارة من المشروبات الغازية المنعشة محلية الصنع؟ تجعل آلة درينكميت من السهل جداً إنشاء مشروبات لذيذة ليست فقط طيبة المذاق ولكن أيضاً أكثر صحة من البدائل التي تباع في المتاجر. قل وداعاً للنكهات الاصطناعية ومرحباً بالمنعشات الطبيعية والقابلة للتخصيص!",
            whyMake: {
              title: "لماذا تصنع مشروباتك الغازية الخاصة؟",
              health: {
                title: "الفوائد الصحية",
                benefit1: "لا توجد مواد حافظة أو ألوان اصطناعية",
                benefit2: "التحكم في مستويات الحلاوة",
                benefit3: "مكونات طبيعية فقط",
                benefit4: "محتوى سكر أقل"
              },
              cost: {
                title: "توفير التكلفة",
                saving1: "أرخص بنسبة 70% من المشترى من المتجر",
                saving2: "زجاجات قابلة لإعادة الاستخدام",
                saving3: "شراء المكونات بكميات كبيرة",
                saving4: "لا توجد تكاليف نقل"
              }
            },
            excerpt: "تغلب على حرارة الصيف مع وصفات المشروبات الغازية اللذيذة والسهلة الصنع باستخدام آلة درينكميت.",
            author: "فريق درينكميت",
            date: "15 يناير 2024",
            tags: {
              recipes: "الوصفات",
              summer: "الصيف",
              refreshing: "منعش",
              healthy: "صحي",
              sparkling: "غازي"
            }
          },
          post2: {
            title: "العلم وراء التكربن المثالي",
            content: "محتوى للمنشور العلمي...",
            excerpt: "تعلم عن كيمياء التكربن وكيف تنشئ تقنية درينكميت الفقاعات المثالية في كل مرة.",
            author: "د. أحمد حسن",
            date: "12 يناير 2024",
            tags: {
              science: "العلم",
              chemistry: "الكيمياء",
              carbonation: "التكربن",
              technology: "التقنية"
            }
          },
          post3: {
            title: "كيف تختار أسطوانة ثاني أكسيد الكربون المثالية لدرينكميت",
            content: "محتوى لمنشور الدليل...",
            excerpt: "تعلم كيف تختار الحجم المثالي لأسطوانة ثاني أكسيد الكربون لآلة درينكميت بناءً على الاستخدام والتكلفة والراحة.",
            author: "فريق درينكميت",
            date: "10 يناير 2024",
            tags: {
              guide: "الدليل",
              co2: "ثاني أكسيد الكربون",
              equipment: "المعدات",
              tips: "النصائح"
            }
          },
          post4: {
            title: "أفضل 5 شرابات إيطالية فاخرة لدرينكميت",
            content: "محتوى لمنشور المنتجات...",
            excerpt: "اكتشف أفضل 5 شرابات إيطالية فاخرة ستغير مشروبات درينكميت إلى متعة إيطالية أصيلة.",
            author: "فريق درينكميت",
            date: "8 يناير 2024",
            tags: {
              products: "المنتجات",
              italian: "إيطالي",
              syrups: "الشرابات",
              premium: "فاخر"
            }
          },
          post5: {
            title: "التأثير البيئي: كيف يقلل درينكميت من النفايات البلاستيكية",
            content: "محتوى لمنشور البيئة...",
            excerpt: "اكتشف كيف تساعد آلة درينكميت في تقليل النفايات البلاستيكية وحماية البيئة مع توفير المال.",
            author: "فريق البيئة",
            date: "5 يناير 2024",
            tags: {
              environment: "البيئة",
              plastic: "البلاستيك",
              sustainability: "الاستدامة",
              green: "أخضر"
            }
          },
          post6: {
            title: "الفوائد الصحية للمياه الغازية: الخرافات مقابل الحقائق",
            content: "محتوى لمنشور الصحة...",
            excerpt: "اكتشف الحقيقة حول الفوائد الصحية للمياه الغازية ودحض الخرافات الشائعة بالأدلة العلمية.",
            author: "د. سارة جونسون",
            date: "3 يناير 2024",
            tags: {
              health: "الصحة",
              benefits: "الفوائد",
              myths: "الخرافات",
              science: "العلم"
            }
          },
          post7: {
            title: "كيف تستضيف حفلة التكربن المثالية مع درينكميت",
            content: "محتوى لمنشور نمط الحياة...",
            excerpt: "تعلم كيف تستضيف حفلة تكربن لا تُنسى ستعرض آلة درينكميت وتثير إعجاب ضيوفك.",
            author: "فريق درينكميت",
            date: "30 ديسمبر 2023",
            tags: {
              party: "الحفلة",
              entertainment: "الترفيه",
              social: "اجتماعي",
              lifestyle: "نمط الحياة",
              carbonation: "التكربن"
            }
          },
          authorBio: {
            team: "فريقنا الخبير من عشاق المشروبات ومتخصصي التكربن الذين يهتمون بمساعدتك في إنشاء المشروبات الغازية المثالية في المنزل.",
            expert: "خبير متحمس في مجاله، مكرس لمشاركة المعرفة والرؤى حول تقنية التكربن وعلوم المشروبات."
          }
        }
    },
    privacyPolicy: {
      hero: {
        title: "سياسة الخصوصية",
        subtitle: "كيف نحمي معلوماتك",
        lastUpdated: "آخر تحديث: يناير 2024"
      },
      sections: {
        informationWeCollect: {
          title: "المعلومات التي نجمعها",
          description: "نجمع المعلومات لتقديم خدمات أفضل لعملائنا.",
          personalInfo: "المعلومات الشخصية",
          usageData: "بيانات الاستخدام",
          cookies: "ملفات تعريف الارتباط وتقنيات التتبع"
        },
        howWeUseInformation: {
          title: "كيف نستخدم معلوماتك",
          description: "نستخدم المعلومات التي نجمعها لتقديم وصيانة وتحسين خدماتنا.",
          purposes: [
            "معالجة وتنفيذ طلباتك",
            "تقديم دعم العملاء",
            "إرسال التحديثات والاتصالات التسويقية",
            "تحسين منتجاتنا وخدماتنا",
            "ضمان الأمان ومنع الاحتيال"
          ]
        },
        informationSharing: {
          title: "مشاركة المعلومات",
          description: "نحن لا نبيع أو نتاجر أو ننقل معلوماتك الشخصية إلى أطراف ثالثة.",
          exceptions: [
            "مع موافقتك الصريحة",
            "للامتثال للالتزامات القانونية",
            "لحماية حقوقنا وسلامتنا",
            "مع مزودي الخدمات الموثوقين"
          ]
        },
        dataSecurity: {
          title: "أمان البيانات",
          description: "نحن نطبق تدابير أمان مناسبة لحماية معلوماتك الشخصية.",
          measures: [
            "تشفير البيانات الحساسة",
            "تقييمات الأمان المنتظمة",
            "ضوابط الوصول والمصادقة",
            "نقل البيانات الآمن"
          ]
        },
        yourRights: {
          title: "حقوقك",
          description: "لديك حقوق معينة فيما يتعلق بمعلوماتك الشخصية.",
          rights: [
            "الوصول إلى بياناتك الشخصية",
            "تصحيح المعلومات غير الدقيقة",
            "طلب حذف بياناتك",
            "الانسحاب من الاتصالات التسويقية",
            "قابلية نقل البيانات"
          ]
        },
        contactUs: {
          title: "اتصل بنا",
          description: "إذا كان لديك أسئلة حول سياسة الخصوصية هذه، يرجى الاتصال بنا.",
          email: "privacy@drinkmate.sa",
          phone: "+966 50 123 4567"
        },
        personalInfoDetails: {
          nameContact: "الاسم ومعلومات الاتصال (البريد الإلكتروني، الهاتف، العنوان)",
          paymentBilling: "معلومات الدفع والفواتير",
          orderHistory: "تاريخ الطلبات والتفضيلات",
          customerService: "اتصالات خدمة العملاء"
        },
        usageDataDetails: {
          ipDevice: "عنوان IP ومعلومات الجهاز",
          websiteUsage: "بيانات استخدام الموقع والتحليلات",
          browserOS: "نوع المتصفح ونظام التشغيل"
        },
        cookiesDetails: {
          trackingTech: "ملفات تعريف الارتباط وتقنيات التتبع",
          sessionData: "بيانات الجلسة والتفضيلات",
          thirdPartyAnalytics: "التحليلات من الطرف الثالث"
        },
        purposesDetails: {
          processOrders: "معالجة وتنفيذ طلباتك",
          customerSupport: "تقديم دعم العملاء",
          updatesMarketing: "إرسال التحديثات والاتصالات التسويقية",
          improveServices: "تحسين منتجاتنا وخدماتنا",
          securityFraud: "ضمان الأمان ومنع الاحتيال"
        },
        exceptionsDetails: {
          explicitConsent: "مع موافقتك الصريحة",
          legalObligations: "للامتثال للالتزامات القانونية",
          protectRights: "لحماية حقوقنا وسلامتنا",
          trustedProviders: "مع مزودي الخدمات الموثوقين"
        },
        securityDetails: {
          encryption: "تشفير البيانات الحساسة",
          securityAssessments: "تقييمات الأمان المنتظمة",
          accessControls: "ضوابط الوصول والمصادقة",
          secureTransmission: "نقل البيانات الآمن"
        },
        rightsDetails: {
          accessData: "الوصول إلى بياناتك الشخصية",
          correctInfo: "تصحيح المعلومات غير الدقيقة",
          deleteData: "طلب حذف بياناتك",
          optOutMarketing: "الانسحاب من الاتصالات التسويقية",
          dataPortability: "قابلية نقل البيانات"
        },
        address: "الرياض، المملكة العربية السعودية"
      }
    },
    termsOfService: {
      hero: {
        title: "شروط الخدمة",
        subtitle: "شروطنا وأحكامنا",
        lastUpdated: "آخر تحديث: يناير 2024"
      },
      sections: {
        acceptance: {
          title: "قبول الشروط",
          description: "باستخدام موقعنا الإلكتروني وخدماتنا، فإنك توافق على هذه الشروط والأحكام."
        },
        services: {
          title: "الخدمات",
          description: "نحن نقدم صانعات الصودا وأسطوانات ثاني أكسيد الكربون والمنتجات والخدمات ذات الصلة.",
          included: [
            "بيع المنتجات والتوصيل",
            "خدمات إعادة ملء وتبادل ثاني أكسيد الكربون",
            "دعم العملاء والضمان",
            "الطلبات عبر الإنترنت والتتبع"
          ]
        },
        userObligations: {
          title: "التزامات المستخدم",
          description: "يجب على المستخدمين الامتثال لجميع القوانين واللوائح المعمول بها.",
          obligations: [
            "تقديم معلومات دقيقة",
            "استخدام المنتجات بأمان وبالطريقة المقصودة",
            "احترام حقوق الملكية الفكرية",
            "الحفاظ على أمان الحساب"
          ]
        },
        payment: {
          title: "شروط الدفع",
          description: "مطلوب الدفع في وقت تقديم الطلب.",
          terms: [
            "جميع الأسعار بالريال السعودي",
            "طرق الدفع المقبولة: بطاقات الائتمان، التحويل المصرفي",
            "يتم معالجة الطلبات بعد تأكيد الدفع",
            "المبالغ المستردة تتم معالجتها خلال 5-7 أيام عمل"
          ]
        },
        shipping: {
          title: "سياسة الشحن",
          description: "نحن نقدم خيارات شحن مختلفة لتلبية احتياجاتك.",
          policies: [
            "شحن مجاني للطلبات فوق 150 ريال",
            "التوصيل القياسي: 3-5 أيام عمل",
            "التوصيل السريع: 1-2 يوم عمل",
            "الاستلام المحلي متاح في الرياض"
          ]
        },
        returns: {
          title: "سياسة الإرجاع",
          description: "نحن نقدم نافذة إرجاع 30 يوماً لمعظم المنتجات.",
          policy: [
            "يجب أن تكون العناصر في حالتها الأصلية",
            "شحن إرجاع مجاني",
            "استرداد كامل أو تبديل",
            "أسطوانات ثاني أكسيد الكربون غير مؤهلة للإرجاع"
          ]
        },
        warranty: {
          title: "الضمان",
          description: "منتجاتنا تأتي مع ضمانات الشركة المصنعة.",
          coverage: [
            "ضمان سنتان على صانعات الصودا",
            "ضمان سنة واحدة على الملحقات",
            "الضمان يغطي عيوب التصنيع",
            "الاستخدام العادي والتآكل غير مغطى"
          ]
        },
        liability: {
          title: "تقييد المسؤولية",
          description: "مسؤوليتنا محدودة إلى الحد الذي يسمح به القانون.",
          limitations: [
            "الحد الأقصى للمسؤولية: سعر شراء المنتج",
            "لا توجد مسؤولية عن الأضرار غير المباشرة",
            "لا توجد مسؤولية عن سوء استخدام المنتجات",
            "أحداث القوة القاهرة مستثناة"
          ]
        },
        termination: {
          title: "إنهاء الخدمة",
          description: "قد ننهي الخدمات لانتهاكات هذه الشروط.",
          conditions: [
            "انتهاك الشروط والأحكام",
            "الأنشطة الاحتيالية أو غير القانونية",
            "عدم دفع الرسوم",
            "إساءة استخدام الخدمات"
          ]
        },
        contact: {
          title: "معلومات الاتصال",
          description: "للأسئلة حول هذه الشروط، يرجى الاتصال بنا.",
          email: "legal@drinkmate.sa",
          phone: "+966 50 123 4567"
        },
        servicesDetails: {
          productSales: "بيع المنتجات والتوصيل",
          co2Services: "خدمات إعادة ملء وتبادل ثاني أكسيد الكربون",
          customerSupport: "دعم العملاء والضمان",
          onlineOrdering: "الطلبات عبر الإنترنت والتتبع"
        },
        obligationsDetails: {
          accurateInfo: "تقديم معلومات دقيقة",
          safeUsage: "استخدام المنتجات بأمان وبالطريقة المقصودة",
          intellectualProperty: "احترام حقوق الملكية الفكرية",
          accountSecurity: "الحفاظ على أمان الحساب"
        },
        paymentDetails: {
          sarPrices: "جميع الأسعار بالريال السعودي",
          paymentMethods: "طرق الدفع المقبولة: بطاقات الائتمان، التحويل المصرفي",
          orderProcessing: "يتم معالجة الطلبات بعد تأكيد الدفع",
          refundTiming: "المبالغ المستردة تتم معالجتها خلال 5-7 أيام عمل"
        },
        shippingDetails: {
          freeShipping: "شحن مجاني للطلبات فوق 150 ريال",
          standardDelivery: "التوصيل القياسي: 3-5 أيام عمل",
          expressDelivery: "التوصيل السريع: 1-2 يوم عمل",
          localPickup: "الاستلام المحلي متاح في الرياض"
        },
        returnsDetails: {
          originalCondition: "يجب أن تكون العناصر في حالتها الأصلية",
          freeReturn: "شحن إرجاع مجاني",
          fullRefund: "استرداد كامل أو تبديل",
          co2NotEligible: "أسطوانات ثاني أكسيد الكربون غير مؤهلة للإرجاع"
        },
        warrantyDetails: {
          sodaMakerWarranty: "ضمان سنتان على صانعات الصودا",
          accessoriesWarranty: "ضمان سنة واحدة على الملحقات",
          manufacturingDefects: "الضمان يغطي عيوب التصنيع",
          normalWear: "الاستخدام العادي والتآكل غير مغطى"
        },
        liabilityDetails: {
          maxLiability: "الحد الأقصى للمسؤولية: سعر شراء المنتج",
          noIndirectDamages: "لا توجد مسؤولية عن الأضرار غير المباشرة",
          noMisuseLiability: "لا توجد مسؤولية عن سوء استخدام المنتجات",
          forceMajeure: "أحداث القوة القاهرة مستثناة"
        },
        terminationDetails: {
          termsViolation: "انتهاك الشروط والأحكام",
          fraudulentActivities: "الأنشطة الاحتيالية أو غير القانونية",
          nonPayment: "عدم دفع الرسوم",
          serviceAbuse: "إساءة استخدام الخدمات"
        },
        address: "الرياض، المملكة العربية السعودية"
      }
    },
    cookiePolicy: {
      hero: {
        title: "سياسة ملفات تعريف الارتباط",
        subtitle: "كيف نستخدم ملفات تعريف الارتباط",
        lastUpdated: "آخر تحديث: يناير 2024"
      },
      sections: {
        whatAreCookies: {
          title: "ما هي ملفات تعريف الارتباط؟",
          description: "ملفات تعريف الارتباط هي ملفات نصية صغيرة تُخزن على جهازك عند زيارة موقعنا الإلكتروني."
        },
        howWeUseCookies: {
          title: "كيف نستخدم ملفات تعريف الارتباط",
          description: "نحن نستخدم ملفات تعريف الارتباط لتحسين تجربة التصفح وتقديم محتوى مخصص.",
          purposes: [
            "تذكر تفضيلاتك وإعداداتك",
            "تحليل حركة المرور على الموقع والاستخدام",
            "تقديم محتوى وإعلانات مخصصة",
            "تحسين وظائف الموقع",
            "ضمان الأمان ومنع الاحتيال"
          ]
        },
        typesOfCookies: {
          title: "أنواع ملفات تعريف الارتباط التي نستخدمها",
          essential: "ملفات تعريف الارتباط الأساسية ضرورية لكي يعمل الموقع بشكل صحيح.",
          analytics: "ملفات تعريف الارتباط التحليلية تساعدنا في فهم كيفية استخدام الزوار لموقعنا.",
          marketing: "ملفات تعريف الارتباط التسويقية تُستخدم لتقديم إعلانات ذات صلة.",
          preferences: "ملفات تعريف الارتباط التفضيلية تتذكر خياراتك وإعداداتك."
        },
        managingCookies: {
          title: "إدارة ملفات تعريف الارتباط",
          description: "يمكنك التحكم في ملفات تعريف الارتباط وإدارتها من خلال إعدادات المتصفح.",
          browser: "إعدادات المتصفح",
          settings: "معظم المتصفحات تسمح لك بحظر أو حذف ملفات تعريف الارتباط."
        },
        thirdPartyCookies: {
          title: "ملفات تعريف الارتباط من أطراف ثالثة",
          description: "بعض ملفات تعريف الارتباط تُوضع بواسطة خدمات الطرف الثالث التي نستخدمها.",
          services: [
            "جوجل أناليتكس لتحليل الموقع",
            "فيسبوك بيكسل للإعلانات",
            "معالجات الدفع للمعاملات الآمنة",
            "منصات وسائل التواصل الاجتماعي للمشاركة"
          ]
        },
        updates: {
          title: "تحديثات السياسة",
          description: "قد نحدث سياسة ملفات تعريف الارتباط هذه من وقت لآخر. يرجى التحقق بانتظام."
        },
        contact: {
          title: "اتصل بنا",
          description: "إذا كان لديك أسئلة حول استخدامنا لملفات تعريف الارتباط، يرجى الاتصال بنا.",
          email: "privacy@drinkmate.sa"
        },
        purposesDetails: {
          rememberPreferences: "تذكر تفضيلاتك وإعداداتك",
          analyzeTraffic: "تحليل حركة المرور على الموقع والاستخدام",
          personalizedContent: "تقديم محتوى وإعلانات مخصصة",
          improveFunctionality: "تحسين وظائف الموقع",
          ensureSecurity: "ضمان الأمان ومنع الاحتيال"
        },
        thirdPartyServices: {
          googleAnalytics: "جوجل أناليتكس لتحليل الموقع",
          facebookPixel: "فيسبوك بيكسل للإعلانات",
          paymentProcessors: "معالجات الدفع للمعاملات الآمنة",
          socialMedia: "منصات وسائل التواصل الاجتماعي للمشاركة"
        },
        address: "الرياض، المملكة العربية السعودية"
      }
    },
    co2: {
      hero: {
        title: "حلول ثاني أكسيد الكربون",
        subtitle: "حافظ على مشروباتك متلألئة",
        description: "أسطوانات ثاني أكسيد الكربون عالية الجودة وخدمات التبادل المريحة. حافظ على تجربة درينكميت مع حلول ثاني أكسيد الكربون الموثوقة.",
        orderCO2: "اطلب ثاني أكسيد الكربون",
        learnMore: "اعرف المزيد",
        drinksLabel: "مشروب",
        liters: "60 لتر"
      },
      productOptions: {
        title: "خيارات أسطوانات ثاني أكسيد الكربون",
        subtitle: "اختر الحل المثالي لاحتياجاتك",
        singleCylinder: {
          title: "أسطوانة واحدة",
          description: "مثالية للاستخدام الفردي",
          capacity: "60 لتر",
          price: "99 ريال",
          lifespan: "2-3 أشهر",
          orderNow: "اطلب الآن"
        },
        exchangeProgram: {
          title: "برنامج التبادل",
          description: "أرجع الفارغة واحصل على ممتلئة",
          exchangeFee: "55 ريال",
          convenience: "بدون متاعب",
          ecoFriendly: "صديق للبيئة",
          exchangeNow: "تبادل الآن"
        },
        bulkOrders: {
          title: "الطلبات بالجملة",
          description: "للشركات والفعاليات",
          minQuantity: "10 أسطوانات",
          discount: "خصم 15%",
          delivery: "توصيل مجاني",
          getQuote: "احصل على عرض سعر"
        }
      },
      refillServices: {
        title: "خدمات إعادة ملء ثاني أكسيد الكربون",
        subtitle: "إعادة ملء احترافية بمعايير السلامة",
        safetyFirst: {
          title: "السلامة أولاً",
          description: "جميع أسطوانات ثاني أكسيد الكربون لدينا معتمدة للاستخدام الغذائي وتخضع لفحوصات سلامة صارمة.",
          foodGradeCertification: "شهادة ثاني أكسيد الكربون للاستخدام الغذائي",
          regularSafetyInspections: "فحوصات سلامة منتظمة",
          properHandlingProcedures: "إجراءات التعامل الصحيحة",
          emergencyProtocols: "بروتوكولات الطوارئ"
        },
        convenientDelivery: {
          title: "توصيل مريح",
          description: "نقدم خدمات توصيل سريعة وموثوقة إلى باب منزلك.",
          sameDayDelivery: "توصيل في نفس اليوم متاح",
          flexibleScheduling: "جدولة مرنة",
          professionalHandling: "تعامل احترافي",
          realTimeTracking: "تتبع في الوقت الفعلي"
        }
      },
      exchangeProgram: {
        title: "برنامج تبادل ثاني أكسيد الكربون",
        subtitle: "حل مستدام وفعال من حيث التكلفة",
        howItWorks: "كيف يعمل",
        step1: {
          title: "أرجع الأسطوانة الفارغة",
          description: "أرسل أسطوانتك الفارغة"
        },
        step2: {
          title: "احصل على أسطوانة ممتلئة",
          description: "استلم أسطوانة ثاني أكسيد كربون جديدة وممتلئة"
        },
        step3: {
          title: "ادفع الفرق فقط",
          description: "وفر حتى 40% مقارنة بالجديدة"
        },
        saveMoney: "وفر المال",
        ecoFriendly: "صديق للبيئة"
      },
      safetyHandling: {
        title: "سلامة وتداول ثاني أكسيد الكربون",
        subtitle: "إرشادات مهمة للاستخدام الآمن",
        safetyGuidelines: {
          title: "إرشادات السلامة",
          guideline1: "خزن في مكان بارد وجاف",
          guideline2: "استخدم حاوية مناسبة للنقل",
          guideline3: "اتبع إرشادات السلامة للتخلص",
          guideline4: "لا تعرض للحرارة العالية"
        },
        properUsage: {
          title: "الاستخدام الصحيح",
          usage1: "اقرأ التعليمات بعناية",
          usage2: "استخدم المعدات المناسبة",
          usage3: "تحقق من سلامة الأسطوانة",
          usage4: "احتفظ بسجل الاستخدام"
        }
      },
      environmentalImpact: {
        title: "التأثير البيئي",
        subtitle: "التزامنا بالاستدامة",
        reducedWaste: {
          title: "تقليل النفايات",
          description: "الأسطوانات القابلة لإعادة الاستخدام تقلل من الحاويات ذات الاستخدام الواحد"
        },
        circularEconomy: {
          title: "الاقتصاد الدائري",
          description: "نظام تبادل مستدام"
        },
        safeDisposal: {
          title: "التخلص الآمن",
          description: "إرشادات للتخلص الصحيح"
        }
      },
      businessSolutions: {
        title: "حلول للشركات",
        subtitle: "خدمات مخصصة للشركات",
        restaurantsCafes: {
          title: "المطاعم والمقاهي",
          description: "حلول ثاني أكسيد الكربون المخصصة لصناعة الغذاء",
          feature1: "أسعار بالجملة",
          feature2: "توصيل مجدول",
          feature3: "دعم مخصص",
          feature4: "خدمة 24/7",
          getBusinessQuote: "احصل على عرض سعر للشركات"
        },
        eventsCatering: {
          title: "الفعاليات والضيافة",
          description: "خدمات للفعاليات الخاصة",
          feature1: "تخطيط الفعاليات",
          feature2: "خدمة الضيافة",
          feature3: "معدات احترافية",
          feature4: "دعم الفعاليات",
          eventPlanning: "تخطيط الفعاليات"
        }
      }
    },
    contact: {
      title: "تواصل معنا",
      subtitle: "نحن هنا للمساعدة",
      description: "هل لديك أسئلة حول منتجاتنا أو تحتاج إلى دعم؟ تواصل معنا من خلال أي قناة أدناه.",
      phoneSupport: {
        title: "الدعم الهاتفي",
        description: "تحدث مباشرة مع فريق الدعم لدينا",
        hours: "الاثنين-الجمعة: 9 صباحاً-6 مساءً (توقيت السعودية)"
      },
      emailSupport: {
        title: "الدعم عبر البريد الإلكتروني",
        description: "أرسل لنا رسالة مفصلة",
        response: "رد خلال 24 ساعة"
      },
      officeLocation: {
        title: "موقع المكتب",
        description: "زر مكتبنا الرئيسي",
        appointment: "بموعد مسبق فقط"
      },
      form: {
        title: "أرسل لنا رسالة",
        subtitle: "املأ النموذج وسنرد في أقرب وقت",
        fullName: "الاسم الكامل *",
        email: "عنوان البريد الإلكتروني *",
        subject: "الموضوع *",
        message: "الرسالة *",
        sendMessage: "أرسل الرسالة",
        subjects: {
          general: "استفسار عام",
          product: "سؤال عن المنتج",
          support: "الدعم التقني",
          order: "حالة الطلب",
          refund: "طلب استرداد",
          other: "أخرى"
        },
        placeholders: {
          fullName: "أدخل اسمك الكامل",
          email: "أدخل بريدك الإلكتروني",
          subject: "اختر موضوعاً",
          message: "كيف يمكننا مساعدتك؟"
        }
      },
      faq: {
        title: "الأسئلة الشائعة",
        subtitle: "أسئلة شائعة حول منتجاتنا",
        questions: {
          q1: "كيف تعمل درينكميت؟",
          a1: "تستخدم ثاني أكسيد الكربون لإضافة الغاز لأي سائل في ثوانٍ بضغطة بسيطة.",
          q2: "كم تدوم أسطوانة ثاني أكسيد الكربون؟",
          a2: "أسطوانة 60 لتر تضيف الغاز لحوالي 60 لتر من السائل.",
          q3: "هل يمكنني إضافة الغاز لأي مشروب؟",
          a3: "نعم! بما في ذلك العصير والنبيذ والكوكتيلات والمزيد.",
          q4: "كيف أعيد ملء ثاني أكسيد الكربون؟",
          a4: "استخدم برنامج التبادل أو زر مواقع الشركاء.",
          q5: "هل الشراب طبيعي؟",
          a5: "نعم، جميع الشرابات تستخدم مكونات طبيعية بدون مواد حافظة اصطناعية.",
          q6: "ما هي مدة الضمان؟",
          a6: "ضمان سنتين على الآلات مع خيارات ممتدة."
        }
      },
      liveChat: {
        title: "هل تحتاج مساعدة فورية؟",
        description: "تحدث مع فريق الدعم لدينا في الوقت الفعلي",
        startChat: "ابدأ الدردشة المباشرة"
      },
      offices: {
        title: "مكاتبنا",
        subtitle: "زرنا شخصياً",
        riyadh: {
          title: "المكتب الرئيسي - الرياض",
          address: "طريق الملك فهد، العليا، الرياض",
          hours: "الاثنين-الجمعة: 9:00 صباحاً - 6:00 مساءً",
          phone: "+966 50 123 4567"
        },
        jeddah: {
          title: "مركز الخدمة - جدة",
          address: "طريق الأمير سلطان، الحمراء، جدة",
          hours: "الاثنين-الجمعة: 8:00 صباحاً - 5:00 مساءً",
          phone: "+966 50 987 6543"
        }
      },
      testimonials: {
        title: "تعليقات العملاء",
        subtitle: "ماذا يقول عملاؤنا",
        testimonial1: {
          text: "خدمة ممتازة! ساعدني الفريق في اختيار صانعة الصودا المثالية.",
          author: "أحمد س.",
          role: "عميل موثق"
        },
        testimonial2: {
          text: "وقت استجابة سريع وموظفين مفيدين جداً. حلوا مشكلة إعادة ملء ثاني أكسيد الكربون بسرعة.",
          author: "سارة م.",
          role: "عميلة موثقة"
        },
        testimonial3: {
          text: "خدمة احترافية مع معرفة كبيرة بالمنتجات.",
          author: "محمد ك.",
          role: "عميل موثق"
        }
      }
    },
    recipes: {
      hero: {
        title: "أنشئ وصفات",
        subtitle: "مشروبات مذهلة",
        description: "اكتشف وصفات مشروبات لذيذة ومنعشة باستخدام شراباتنا الإيطالية عالية الجودة. من المفضلات الكلاسيكية إلى التركيبات الإبداعية، هناك شيء للجميع!",
        exploreRecipes: "استكشف الوصفات",
        downloadPDF: "تحميل PDF",
        recipesCountNumber: "+45",
        recipesLabel: "وصفة"
      },
      featuredRecipe: {
        recipeOfTheWeek: "وصفة الأسبوع",
        description: "وصفة هذا الأسبوع المميزة تعرض التوازن المثالي للنكهات وهي مثالية لأي مناسبة.",
        prepTime: "وقت التحضير",
        difficulty: "الصعوبة",
        ingredients: "المكونات",
        instructions: "التعليمات",
        saveRecipe: "حفظ الوصفة",
        share: "مشاركة"
      },
      categories: {
        all: "الكل",
        fruity: "الفواكه",
        citrus: "الحمضيات",
        berry: "التوت",
        cola: "الكولا"
      },
      recipeData: {
        italianStrawberryLemonade: {
          name: "ليمونادة الفراولة الإيطالية",
          category: "الفواكه",
          difficulty: "سهل",
          time: "5 دقائق",
          instructions: "اخلط شراب الفراولة والليمون مع الماء الفوار، أضف شرائح الليمون الطازج والثلج. زين بأوراق النعناع للحصول على نضارة إضافية."
        },
        cherryColaFizz: {
          name: "فوار كرز الكولا",
          category: "الكولا",
          difficulty: "سهل",
          time: "3 دقائق",
          instructions: "امزج شراب كرز الكولا مع الماء الفوار والثلج. قدمه فوراً للحصول على أقصى فوران."
        },
        blueRaspberryBlast: {
          name: "انفجار التوت الأزرق",
          category: "التوت",
          difficulty: "متوسط",
          time: "7 دقائق",
          instructions: "اخلط شراب التوت الأزرق مع الماء الفوار، أضف التوت الأزرق الطازج والنعناع. زين بغصن نعناع."
        },
        limeMojitoSparkle: {
          name: "موهيتو الليمون الفوار",
          category: "الحمضيات",
          difficulty: "متوسط",
          time: "8 دقائق",
          instructions: "امزج شراب الليمون مع الماء الفوار، أضف الليمون الطازج وأوراق النعناع والسكر والثلج. حرك برفق لخلط النكهات."
        },
        orangeCreamsicle: {
          name: "كريم البرتقال",
          category: "الفواكه",
          difficulty: "سهل",
          time: "4 دقائق",
          instructions: "اخلط شراب البرتقال والفانيليا مع الماء الفوار، أضف الكريمة والثلج. حرك برفق لإنشاء ملمس كريمي."
        },
        grapeSodaSupreme: {
          name: "مشروب العنب الممتاز",
          category: "الفواكه",
          difficulty: "سهل",
          time: "3 دقائق",
          instructions: "امزج شراب العنب مع الماء الفوار والثلج. قدمه فوراً للحصول على أفضل كربنة."
        }
      },
      ingredients: {
        strawberryLemonSyrup: "شراب الفراولة والليمون",
        cherryColaSyrup: "شراب كرز الكولا",
        blueRaspberrySyrup: "شراب التوت الأزرق",
        limeSyrup: "شراب الليمون",
        orangeSyrup: "شراب البرتقال",
        vanillaSyrup: "شراب الفانيليا",
        grapeSyrup: "شراب العنب",
        sparklingWater: "الماء الفوار",
        freshLemon: "ليمون طازج",
        freshBlueberries: "توت أزرق طازج",
        mint: "نعناع",
        mintLeaves: "أوراق النعناع",
        sugar: "سكر",
        cream: "كريمة",
        ice: "ثلج"
      },
      tags: {
        refreshing: "منعش",
        summer: "صيفي",
        popular: "شائع",
        classic: "كلاسيكي",
        bold: "جريء",
        fizzy: "فوار",
        berry: "توت",
        gourmet: "ذواقة",
        citrus: "حمضي",
        mojito: "موهيتو",
        fresh: "طازج",
        creamy: "كريمي",
        orange: "برتقالي",
        dessert: "حلويات",
        grape: "عنب",
        simple: "بسيط"
      },
      recipeCard: {
        reviews: "تقييمات",
        ingredients: "مكونات",
        viewRecipe: "عرض الوصفة"
      },
      newsletter: {
        title: "احصل على وصفات جديدة أسبوعياً",
        description: "اشترك في نشرتنا الإخبارية واحصل على وصفات مشروبات جديدة ونصائح وعروض حصرية كل أسبوع!",
        emailPlaceholder: "أدخل بريدك الإلكتروني",
        subscribe: "اشتراك"
      },
      difficultyLevels: {
        title: "مستويات صعوبة الوصفات",
        subtitle: "اختر الوصفات التي تناسب مستوى مهارتك وخبرتك",
        beginner: {
          title: "مبتدئ",
          description: "مثالي للمبتدئين في صنع المشروبات الفوارة",
          feature1: "مكونات بسيطة",
          feature2: "تقنيات أساسية",
          feature3: "تحضير سريع"
        },
        intermediate: {
          title: "متوسط",
          description: "ممتاز لمن لديهم بعض الخبرة",
          feature1: "مكونات متعددة",
          feature2: "زخرفة أساسية",
          feature3: "تركيبات نكهات"
        },
        advanced: {
          title: "متقدم",
          description: "لصناع المشروبات ذوي الخبرة",
          feature1: "وصفات معقدة",
          feature2: "تقنيات متقدمة",
          feature3: "عروض إبداعية"
        }
      },
      seasonalRecipes: {
        title: "مجموعات الوصفات الموسمية",
        subtitle: "اكتشف وصفات مثالية لكل موسم",
        spring: {
          title: "الربيع",
          description: "نكهات خفيفة ومنعشة"
        },
        summer: {
          title: "الصيف",
          description: "تركيبات باردة واستوائية"
        },
        autumn: {
          title: "الخريف",
          description: "نكهات دافئة ومريحة"
        },
        winter: {
          title: "الشتاء",
          description: "مشروبات غنية ومريحة"
        }
      },
      communityRecipes: {
        title: "وصفات المجتمع",
        subtitle: "وصفات مذهلة شاركها مجتمعنا",
        tropicalParadise: {
          title: "الجنة الاستوائية",
          description: "مزيج منعش من الفواكه الاستوائية مع لمسة من جوز الهند",
          by: "بواسطة سارة م.",
          verified: "موثق"
        },
        berryBlast: {
          title: "انفجار التوت",
          description: "انفجار التوت المختلط مع النعناع والليمون",
          by: "بواسطة أحمد ك.",
          verified: "موثق"
        },
        submitYourRecipe: "أرسل وصفتك"
      },
      nutritionalInfo: {
        title: "المعلومات الغذائية",
        subtitle: "تعرف على الفوائد الصحية والمحتوى الغذائي لمشروباتنا",
        calorieUnit: "سعرات حرارية",
        calorieContent: {
          title: "محتوى السعرات الحرارية",
          plainSparklingWater: "الماء الفوار العادي",
          withNaturalSyrup: "مع الشراب الطبيعي",
          premiumSyrupMix: "مزيج الشراب الممتاز"
        },
        healthBenefits: {
          title: "الفوائد الصحية",
          benefit1: "ترطيب بدون سكريات مضافة",
          benefit2: "نكهات طبيعية من مكونات حقيقية",
          benefit3: "بديل منخفض السعرات الحرارية للمشروبات الغازية"
        },
        allergenInfo: {
          title: "معلومات الحساسية",
          info1: "جميع الشرابات خالية من الغلوتين",
          info2: "مصنوعة من مكونات طبيعية",
          info3: "بدون مواد حافظة اصطناعية"
        }
      }
    },
    common: {
      loading: "جاري التحميل...",
      error: "حدث خطأ",
      success: "نجح!",
      close: "إغلاق",
      next: "التالي",
      previous: "السابق",
      search: "بحث",
      filter: "تصفية",
      clear: "مسح",
      apply: "تطبيق",
      cancel: "إلغاء",
      save: "حفظ",
      edit: "تعديل",
      delete: "حذف",
      view: "عرض",
      add: "إضافة",
      remove: "إزالة",
      quantity: "الكمية",
      total: "المجموع",
      subtotal: "المجموع الفرعي",
      shipping: "الشحن",
      tax: "الضريبة",
      discount: "الخصم",
      checkout: "إتمام الشراء",
      continue: "متابعة",
      back: "رجوع",
      home: "الرئيسية",
      about: "حول",
      services: "الخدمات",
      blog: "المدونة",
      privacy: "الخصوصية",
      terms: "الشروط",
      cookies: "ملفات تعريف الارتباط"
    },
    footer: {
      companyDescription: "إنشاء مشروبات غازية مثالية في المنزل مع النكهات الإيطالية عالية الجودة وصانعات الصودا المبتكرة",
      phone: "+966 50 123 4567",
      email: "info@drinkmate.sa",
      address: "الرياض، المملكة العربية السعودية",
      products: {
        title: "المنتجات",
        sodaMakers: "صانعات الصودا",
        co2Cylinders: "أسطوانات ثاني أكسيد الكربون",
        italianSyrups: "الشرابات الإيطالية",
        accessories: "الملحقات",
        giftBundles: "باقات الهدايا",
        bulkOrders: "الطلبات بالجملة"
      },
      information: {
        title: "المعلومات",
        supportHelp: "الدعم والمساعدة",
        trackOrder: "تتبع الطلب",
        drinkRecipes: "وصفات المشروبات",
        blogNews: "المدونة والأخبار",
        privacyPolicy: "سياسة الخصوصية",
        termsOfService: "شروط الخدمة"
      },
      newsletter: {
        title: "ابق على اطلاع",
        description: "احصل على عروض حصرية وإعلانات المنتجات",
        emailPlaceholder: "أدخل بريدك الإلكتروني",
        subscribeButton: "اشترك الآن",
        disclaimer: "يمكنك إلغاء الاشتراك في أي وقت. أسطوانات الغاز غير مؤهلة للخصم."
      },
      social: {
        followUs: "تابعنا:"
      },
      payment: {
        securePayment: "طرق الدفع الآمنة"
      },
      delivery: {
        fastDelivery: "توصيل سريع"
      },
      copyright: "© 2024 درينكميت. جميع الحقوق محفوظة.",
      cookiePolicy: "سياسة ملفات تعريف الارتباط"
    }
  }
};