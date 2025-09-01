import { Language } from './translations';

export interface AdminTranslations {
  // Common
  common: {
    dashboard: string;
    products: string;
    orders: string;
    users: string;
    content: string;
    analytics: string;
    settings: string;
    save: string;
    cancel: string;
    edit: string;
    delete: string;
    view: string;
    search: string;
    filter: string;
    status: string;
    actions: string;
    noResults: string;
    loading: string;
    viewSite: string;
    welcome: string;
  };

  // Dashboard
  dashboard: {
    title: string;
    totalRevenue: string;
    totalOrders: string;
    totalUsers: string;
    conversionRate: string;
    comparedTo: string;
    lastYear: string;
    revenueOverTime: string;
    ordersOverTime: string;
    newUsers: string;
    revenueByCategory: string;
    topSellingProducts: string;
    ordersByRegion: string;
    geographicDistribution: string;
    viewMap: string;
    recentActivity: string;
  };

  // Products
  products: {
    title: string;
    addProduct: string;
    editProduct: string;
    productName: string;
    category: string;
    price: string;
    originalPrice: string;
    stock: string;
    status: string;
    lowStock: string;
    outOfStock: string;
    inStock: string;
    bestSeller: string;
    new: string;
    featured: string;
    bundle: string;
    allCategories: string;
    sodaMakers: string;
    flavors: string;
    accessories: string;
    basicInfo: string;
    details: string;
    images: string;
    variants: string;
    bundleItems: string;
    shortDescription: string;
    fullDescription: string;
    weight: string;
    dimensions: string;
    uploadImages: string;
    dragAndDrop: string;
    currentImages: string;
    noImagesYet: string;
    addColor: string;
    noColorsYet: string;
    noBundleItems: string;
    addToBundlePrompt: string;
    bundleDiscount: string;
  };

  // Orders
  orders: {
    title: string;
    orderId: string;
    customer: string;
    date: string;
    total: string;
    status: string;
    payment: string;
    processing: string;
    shipped: string;
    completed: string;
    cancelled: string;
    paid: string;
    pending: string;
    refunded: string;
    markAsProcessing: string;
    markAsShipped: string;
    markAsCompleted: string;
    cancelOrder: string;
    viewDetails: string;
    exportOrders: string;
    dateRange: string;
    noOrders: string;
  };

  // Users
  users: {
    title: string;
    addUser: string;
    editUser: string;
    username: string;
    email: string;
    joined: string;
    lastLogin: string;
    status: string;
    role: string;
    active: string;
    inactive: string;
    blocked: string;
    admin: string;
    customer: string;
    viewProfile: string;
    blockUser: string;
    unblockUser: string;
    activateUser: string;
    makeAdmin: string;
    removeAdminRole: string;
    deleteUser: string;
    password: string;
    adminPrivileges: string;
    createUser: string;
    saveChanges: string;
  };

  // Content
  content: {
    title: string;
    blogPosts: string;
    recipes: string;
    createPost: string;
    addRecipe: string;
    postTitle: string;
    category: string;
    author: string;
    published: string;
    draft: string;
    featured: string;
    unfeature: string;
    viewPost: string;
    editPost: string;
    deletePost: string;
    noPosts: string;
    noRecipes: string;
    difficulty: string;
    prepTime: string;
    easy: string;
    medium: string;
    hard: string;
    allCategories: string;
    allStatus: string;
  };

  // Analytics
  analytics: {
    title: string;
    timeRange: string;
    last7Days: string;
    last30Days: string;
    last90Days: string;
    thisYear: string;
    allTime: string;
    customRange: string;
    exportReport: string;
  };

  // Settings
  settings: {
    title: string;
    saveAll: string;
    general: {
      title: string;
      siteInfo: string;
      siteName: string;
      siteUrl: string;
      siteDescription: string;
      localization: string;
      defaultLanguage: string;
      defaultCurrency: string;
      timezone: string;
      dateFormat: string;
      appearance: string;
      darkMode: string;
      enableDarkMode: string;
      maintenance: string;
      maintenanceMode: string;
      enableMaintenance: string;
      maintenanceMessage: string;
      siteOffline: string;
    };
    store: {
      title: string;
      storeDetails: string;
      storeName: string;
      storeEmail: string;
      storePhone: string;
      storeAddress: string;
      productSettings: string;
      productsPerPage: string;
      lowStockThreshold: string;
      showOutOfStock: string;
      inventory: string;
      trackInventory: string;
      allowBackorders: string;
    };
    payment: {
      title: string;
      methods: string;
      creditCard: string;
      applePay: string;
      cashOnDelivery: string;
      gateway: string;
      provider: string;
      mode: string;
      live: string;
      test: string;
      apiKey: string;
      checkout: string;
      guestCheckout: string;
      requireTerms: string;
    };
    notifications: {
      title: string;
      emailSettings: string;
      fromEmail: string;
      fromName: string;
      smtpHost: string;
      smtpPort: string;
      encryption: string;
      username: string;
      password: string;
      testConnection: string;
      customerNotifications: string;
      orderConfirmation: string;
      shippingConfirmation: string;
      accountCreation: string;
      adminNotifications: string;
      newOrder: string;
      lowStock: string;
      contactForm: string;
    };
    security: {
      title: string;
      authentication: string;
      twoFactor: string;
      sessionTimeout: string;
      passwordComplexity: string;
      apiAccess: string;
      enableApi: string;
      apiTokens: string;
      manageTokens: string;
      privacy: string;
      privacyPolicy: string;
      termsConditions: string;
      cookieConsent: string;
      dataRetention: string;
    };
  };
}

export const adminTranslations: Record<Language, AdminTranslations> = {
  EN: {
    common: {
      dashboard: "Dashboard",
      products: "Products",
      orders: "Orders",
      users: "Users",
      content: "Content",
      analytics: "Analytics",
      settings: "Settings",
      save: "Save",
      cancel: "Cancel",
      edit: "Edit",
      delete: "Delete",
      view: "View",
      search: "Search",
      filter: "Filter",
      status: "Status",
      actions: "Actions",
      noResults: "No results found",
      loading: "Loading...",
      viewSite: "View Site",
      welcome: "Welcome",
    },
    dashboard: {
      title: "Admin Dashboard",
      totalRevenue: "Total Revenue",
      totalOrders: "Total Orders",
      totalUsers: "Total Users",
      conversionRate: "Conversion Rate",
      comparedTo: "Compared to",
      lastYear: "last year",
      revenueOverTime: "Revenue Over Time",
      ordersOverTime: "Orders Over Time",
      newUsers: "New Users Over Time",
      revenueByCategory: "Revenue by Category",
      topSellingProducts: "Top Selling Products",
      ordersByRegion: "Orders by Region",
      geographicDistribution: "Geographic Distribution",
      viewMap: "View Map",
      recentActivity: "Recent Activity",
    },
    products: {
      title: "Products Management",
      addProduct: "Add Product",
      editProduct: "Edit Product",
      productName: "Product Name",
      category: "Category",
      price: "Price",
      originalPrice: "Original Price",
      stock: "Stock",
      status: "Status",
      lowStock: "Low Stock",
      outOfStock: "Out of Stock",
      inStock: "In Stock",
      bestSeller: "Best Seller",
      new: "New",
      featured: "Featured",
      bundle: "Bundle",
      allCategories: "All Categories",
      sodaMakers: "Soda Makers",
      flavors: "Flavors",
      accessories: "Accessories",
      basicInfo: "Basic Info",
      details: "Details",
      images: "Images",
      variants: "Variants",
      bundleItems: "Bundle Items",
      shortDescription: "Short Description",
      fullDescription: "Full Description",
      weight: "Weight",
      dimensions: "Dimensions",
      uploadImages: "Upload Images",
      dragAndDrop: "Drag and drop image files or click to browse",
      currentImages: "Current Images",
      noImagesYet: "No images uploaded yet",
      addColor: "Add color",
      noColorsYet: "No colors added yet",
      noBundleItems: "No products added to this bundle yet",
      addToBundlePrompt: "Add Products to Bundle",
      bundleDiscount: "Bundle Discount",
    },
    orders: {
      title: "Orders Management",
      orderId: "Order ID",
      customer: "Customer",
      date: "Date",
      total: "Total",
      status: "Status",
      payment: "Payment",
      processing: "Processing",
      shipped: "Shipped",
      completed: "Completed",
      cancelled: "Cancelled",
      paid: "Paid",
      pending: "Pending",
      refunded: "Refunded",
      markAsProcessing: "Mark as Processing",
      markAsShipped: "Mark as Shipped",
      markAsCompleted: "Mark as Completed",
      cancelOrder: "Cancel Order",
      viewDetails: "View details",
      exportOrders: "Export Orders",
      dateRange: "Date Range",
      noOrders: "No orders found",
    },
    users: {
      title: "User Management",
      addUser: "Add User",
      editUser: "Edit User",
      username: "Username",
      email: "Email",
      joined: "Joined",
      lastLogin: "Last Login",
      status: "Status",
      role: "Role",
      active: "Active",
      inactive: "Inactive",
      blocked: "Blocked",
      admin: "Admin",
      customer: "Customer",
      viewProfile: "View profile",
      blockUser: "Block user",
      unblockUser: "Unblock user",
      activateUser: "Activate user",
      makeAdmin: "Make admin",
      removeAdminRole: "Remove admin role",
      deleteUser: "Delete user",
      password: "Password",
      adminPrivileges: "Admin privileges",
      createUser: "Create User",
      saveChanges: "Save Changes",
    },
    content: {
      title: "Content Management",
      blogPosts: "Blog Posts",
      recipes: "Recipes",
      createPost: "Create Blog Post",
      addRecipe: "Add Recipe",
      postTitle: "Title",
      category: "Category",
      author: "Author",
      published: "Published",
      draft: "Draft",
      featured: "Featured",
      unfeature: "Unfeature",
      viewPost: "View post",
      editPost: "Edit post",
      deletePost: "Delete post",
      noPosts: "No blog posts found",
      noRecipes: "No recipes found",
      difficulty: "Difficulty",
      prepTime: "Prep Time",
      easy: "Easy",
      medium: "Medium",
      hard: "Hard",
      allCategories: "All Categories",
      allStatus: "All Status",
    },
    analytics: {
      title: "Analytics & Reporting",
      timeRange: "Time Range",
      last7Days: "Last 7 Days",
      last30Days: "Last 30 Days",
      last90Days: "Last 90 Days",
      thisYear: "This Year",
      allTime: "All Time",
      customRange: "Custom Range",
      exportReport: "Export Report",
    },
    settings: {
      title: "Settings",
      saveAll: "Save All Settings",
      general: {
        title: "General Settings",
        siteInfo: "Site Information",
        siteName: "Site Name",
        siteUrl: "Site URL",
        siteDescription: "Site Description",
        localization: "Localization",
        defaultLanguage: "Default Language",
        defaultCurrency: "Default Currency",
        timezone: "Timezone",
        dateFormat: "Date Format",
        appearance: "Appearance",
        darkMode: "Dark Mode",
        enableDarkMode: "Enable dark mode for the admin dashboard",
        maintenance: "Maintenance",
        maintenanceMode: "Maintenance Mode",
        enableMaintenance: "Put the site in maintenance mode to prevent user access",
        maintenanceMessage: "Maintenance Message",
        siteOffline: "Site Offline",
      },
      store: {
        title: "Store Settings",
        storeDetails: "Store Details",
        storeName: "Store Name",
        storeEmail: "Store Email",
        storePhone: "Store Phone",
        storeAddress: "Store Address",
        productSettings: "Product Settings",
        productsPerPage: "Products Per Page",
        lowStockThreshold: "Low Stock Threshold",
        showOutOfStock: "Show Out of Stock Products",
        inventory: "Inventory Management",
        trackInventory: "Track Inventory",
        allowBackorders: "Allow Backorders",
      },
      payment: {
        title: "Payment Settings",
        methods: "Payment Methods",
        creditCard: "Credit Card",
        applePay: "Apple Pay",
        cashOnDelivery: "Cash on Delivery",
        gateway: "Payment Gateway",
        provider: "Payment Provider",
        mode: "Gateway Mode",
        live: "Live",
        test: "Test/Sandbox",
        apiKey: "API Key",
        checkout: "Checkout Options",
        guestCheckout: "Guest Checkout",
        requireTerms: "Require Terms Acceptance",
      },
      notifications: {
        title: "Notification Settings",
        emailSettings: "Email Settings",
        fromEmail: "From Email",
        fromName: "From Name",
        smtpHost: "SMTP Host",
        smtpPort: "SMTP Port",
        encryption: "Encryption",
        username: "SMTP Username",
        password: "SMTP Password",
        testConnection: "Test Email Connection",
        customerNotifications: "Customer Notifications",
        orderConfirmation: "Order Confirmation",
        shippingConfirmation: "Shipping Confirmation",
        accountCreation: "Account Creation",
        adminNotifications: "Admin Notifications",
        newOrder: "New Order",
        lowStock: "Low Stock",
        contactForm: "Contact Form Submissions",
      },
      security: {
        title: "Security Settings",
        authentication: "Authentication",
        twoFactor: "Two-Factor Authentication",
        sessionTimeout: "Session Timeout (minutes)",
        passwordComplexity: "Enforce Password Complexity",
        apiAccess: "API Access",
        enableApi: "Enable API",
        apiTokens: "API Tokens",
        manageTokens: "Manage API Tokens",
        privacy: "Privacy",
        privacyPolicy: "Privacy Policy URL",
        termsConditions: "Terms & Conditions URL",
        cookieConsent: "Require Cookie Consent",
        dataRetention: "Data Retention Policy",
      },
    },
  },
  AR: {
    common: {
      dashboard: "لوحة التحكم",
      products: "المنتجات",
      orders: "الطلبات",
      users: "المستخدمين",
      content: "المحتوى",
      analytics: "التحليلات",
      settings: "الإعدادات",
      save: "حفظ",
      cancel: "إلغاء",
      edit: "تعديل",
      delete: "حذف",
      view: "عرض",
      search: "بحث",
      filter: "تصفية",
      status: "الحالة",
      actions: "إجراءات",
      noResults: "لم يتم العثور على نتائج",
      loading: "جاري التحميل...",
      viewSite: "عرض الموقع",
      welcome: "مرحبا",
    },
    dashboard: {
      title: "لوحة تحكم المشرف",
      totalRevenue: "إجمالي الإيرادات",
      totalOrders: "إجمالي الطلبات",
      totalUsers: "إجمالي المستخدمين",
      conversionRate: "معدل التحويل",
      comparedTo: "مقارنة بـ",
      lastYear: "العام الماضي",
      revenueOverTime: "الإيرادات عبر الزمن",
      ordersOverTime: "الطلبات عبر الزمن",
      newUsers: "المستخدمين الجدد عبر الزمن",
      revenueByCategory: "الإيرادات حسب الفئة",
      topSellingProducts: "المنتجات الأكثر مبيعًا",
      ordersByRegion: "الطلبات حسب المنطقة",
      geographicDistribution: "التوزيع الجغرافي",
      viewMap: "عرض الخريطة",
      recentActivity: "النشاط الأخير",
    },
    products: {
      title: "إدارة المنتجات",
      addProduct: "إضافة منتج",
      editProduct: "تعديل منتج",
      productName: "اسم المنتج",
      category: "الفئة",
      price: "السعر",
      originalPrice: "السعر الأصلي",
      stock: "المخزون",
      status: "الحالة",
      lowStock: "مخزون منخفض",
      outOfStock: "نفذ من المخزون",
      inStock: "متوفر",
      bestSeller: "الأكثر مبيعًا",
      new: "جديد",
      featured: "مميز",
      bundle: "حزمة",
      allCategories: "جميع الفئات",
      sodaMakers: "صانعات الصودا",
      flavors: "النكهات",
      accessories: "الإكسسوارات",
      basicInfo: "المعلومات الأساسية",
      details: "التفاصيل",
      images: "الصور",
      variants: "المتغيرات",
      bundleItems: "عناصر الحزمة",
      shortDescription: "وصف قصير",
      fullDescription: "وصف كامل",
      weight: "الوزن",
      dimensions: "الأبعاد",
      uploadImages: "تحميل الصور",
      dragAndDrop: "اسحب وأفلت ملفات الصور أو انقر للتصفح",
      currentImages: "الصور الحالية",
      noImagesYet: "لم يتم تحميل صور بعد",
      addColor: "إضافة لون",
      noColorsYet: "لم تتم إضافة ألوان بعد",
      noBundleItems: "لم تتم إضافة منتجات إلى هذه الحزمة بعد",
      addToBundlePrompt: "إضافة منتجات إلى الحزمة",
      bundleDiscount: "خصم الحزمة",
    },
    orders: {
      title: "إدارة الطلبات",
      orderId: "رقم الطلب",
      customer: "العميل",
      date: "التاريخ",
      total: "المجموع",
      status: "الحالة",
      payment: "الدفع",
      processing: "قيد المعالجة",
      shipped: "تم الشحن",
      completed: "مكتمل",
      cancelled: "ملغي",
      paid: "مدفوع",
      pending: "قيد الانتظار",
      refunded: "مسترد",
      markAsProcessing: "تحديد كقيد المعالجة",
      markAsShipped: "تحديد كمشحون",
      markAsCompleted: "تحديد كمكتمل",
      cancelOrder: "إلغاء الطلب",
      viewDetails: "عرض التفاصيل",
      exportOrders: "تصدير الطلبات",
      dateRange: "نطاق التاريخ",
      noOrders: "لم يتم العثور على طلبات",
    },
    users: {
      title: "إدارة المستخدمين",
      addUser: "إضافة مستخدم",
      editUser: "تعديل مستخدم",
      username: "اسم المستخدم",
      email: "البريد الإلكتروني",
      joined: "تاريخ الانضمام",
      lastLogin: "آخر تسجيل دخول",
      status: "الحالة",
      role: "الدور",
      active: "نشط",
      inactive: "غير نشط",
      blocked: "محظور",
      admin: "مشرف",
      customer: "عميل",
      viewProfile: "عرض الملف الشخصي",
      blockUser: "حظر المستخدم",
      unblockUser: "إلغاء حظر المستخدم",
      activateUser: "تنشيط المستخدم",
      makeAdmin: "جعله مشرفًا",
      removeAdminRole: "إزالة دور المشرف",
      deleteUser: "حذف المستخدم",
      password: "كلمة المرور",
      adminPrivileges: "صلاحيات المشرف",
      createUser: "إنشاء مستخدم",
      saveChanges: "حفظ التغييرات",
    },
    content: {
      title: "إدارة المحتوى",
      blogPosts: "مقالات المدونة",
      recipes: "الوصفات",
      createPost: "إنشاء مقال",
      addRecipe: "إضافة وصفة",
      postTitle: "العنوان",
      category: "الفئة",
      author: "المؤلف",
      published: "منشور",
      draft: "مسودة",
      featured: "مميز",
      unfeature: "إلغاء التمييز",
      viewPost: "عرض المقال",
      editPost: "تعديل المقال",
      deletePost: "حذف المقال",
      noPosts: "لم يتم العثور على مقالات",
      noRecipes: "لم يتم العثور على وصفات",
      difficulty: "مستوى الصعوبة",
      prepTime: "وقت التحضير",
      easy: "سهل",
      medium: "متوسط",
      hard: "صعب",
      allCategories: "جميع الفئات",
      allStatus: "جميع الحالات",
    },
    analytics: {
      title: "التحليلات والتقارير",
      timeRange: "النطاق الزمني",
      last7Days: "آخر 7 أيام",
      last30Days: "آخر 30 يوم",
      last90Days: "آخر 90 يوم",
      thisYear: "هذا العام",
      allTime: "كل الوقت",
      customRange: "نطاق مخصص",
      exportReport: "تصدير التقرير",
    },
    settings: {
      title: "الإعدادات",
      saveAll: "حفظ جميع الإعدادات",
      general: {
        title: "الإعدادات العامة",
        siteInfo: "معلومات الموقع",
        siteName: "اسم الموقع",
        siteUrl: "رابط الموقع",
        siteDescription: "وصف الموقع",
        localization: "التوطين",
        defaultLanguage: "اللغة الافتراضية",
        defaultCurrency: "العملة الافتراضية",
        timezone: "المنطقة الزمنية",
        dateFormat: "تنسيق التاريخ",
        appearance: "المظهر",
        darkMode: "الوضع الداكن",
        enableDarkMode: "تفعيل الوضع الداكن للوحة التحكم",
        maintenance: "الصيانة",
        maintenanceMode: "وضع الصيانة",
        enableMaintenance: "وضع الموقع في وضع الصيانة لمنع وصول المستخدمين",
        maintenanceMessage: "رسالة الصيانة",
        siteOffline: "الموقع غير متصل",
      },
      store: {
        title: "إعدادات المتجر",
        storeDetails: "تفاصيل المتجر",
        storeName: "اسم المتجر",
        storeEmail: "بريد المتجر الإلكتروني",
        storePhone: "هاتف المتجر",
        storeAddress: "عنوان المتجر",
        productSettings: "إعدادات المنتج",
        productsPerPage: "المنتجات في الصفحة",
        lowStockThreshold: "حد المخزون المنخفض",
        showOutOfStock: "عرض المنتجات غير المتوفرة",
        inventory: "إدارة المخزون",
        trackInventory: "تتبع المخزون",
        allowBackorders: "السماح بالطلبات المؤجلة",
      },
      payment: {
        title: "إعدادات الدفع",
        methods: "طرق الدفع",
        urways: "أوروايز",
        tapPayment: "تاب باي",
        creditCard: "بطاقة ائتمان",
        applePay: "آبل باي",
        cashOnDelivery: "الدفع عند الاستلام",
        gateway: "بوابة الدفع",
        provider: "مزود الدفع",
        mode: "وضع البوابة",
        live: "مباشر",
        test: "اختبار",
        apiKey: "مفتاح API",
        checkout: "خيارات الدفع",
        guestCheckout: "الدفع كزائر",
        requireTerms: "طلب قبول الشروط",
      },
      notifications: {
        title: "إعدادات الإشعارات",
        emailSettings: "إعدادات البريد الإلكتروني",
        fromEmail: "البريد المرسل",
        fromName: "اسم المرسل",
        smtpHost: "مضيف SMTP",
        smtpPort: "منفذ SMTP",
        encryption: "التشفير",
        username: "اسم مستخدم SMTP",
        password: "كلمة مرور SMTP",
        testConnection: "اختبار الاتصال",
        customerNotifications: "إشعارات العملاء",
        orderConfirmation: "تأكيد الطلب",
        shippingConfirmation: "تأكيد الشحن",
        accountCreation: "إنشاء الحساب",
        adminNotifications: "إشعارات المشرف",
        newOrder: "طلب جديد",
        lowStock: "مخزون منخفض",
        contactForm: "نماذج الاتصال",
      },
      security: {
        title: "إعدادات الأمان",
        authentication: "المصادقة",
        twoFactor: "المصادقة الثنائية",
        sessionTimeout: "مهلة الجلسة (دقائق)",
        passwordComplexity: "فرض تعقيد كلمة المرور",
        apiAccess: "وصول API",
        enableApi: "تمكين API",
        apiTokens: "رموز API",
        manageTokens: "إدارة رموز API",
        privacy: "الخصوصية",
        privacyPolicy: "رابط سياسة الخصوصية",
        termsConditions: "رابط الشروط والأحكام",
        cookieConsent: "طلب موافقة ملفات تعريف الارتباط",
        dataRetention: "سياسة الاحتفاظ بالبيانات",
      },
    },
  }
};
