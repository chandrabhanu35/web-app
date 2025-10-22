// Add structured data for SEO
function addStructuredData() {
    // Organization Schema
    const organizationSchema = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "AptitudePro",
        "url": "https://www.aptitudepro.in",
        "logo": "https://www.aptitudepro.in/images/logo-main.svg",
        "description": "Free online aptitude practice platform for IT, Banking, and Government exams",
        "contactPoint": {
            "@type": "ContactPoint",
            "contactType": "Customer Service",
            "url": "https://www.aptitudepro.in"
        },
        "sameAs": [
            "https://www.facebook.com/aptitudepro",
            "https://www.twitter.com/aptitudepro",
            "https://www.linkedin.com/company/aptitudepro"
        ]
    };

    // Website Schema with Search Action
    const websiteSchema = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "url": "https://www.aptitudepro.in",
        "name": "AptitudePro",
        "description": "Practice aptitude tests online - IT, Banking, and Government exams",
        "potentialAction": {
            "@type": "SearchAction",
            "target": {
                "@type": "EntryPoint",
                "urlTemplate": "https://www.aptitudepro.in/search?q={search_term_string}"
            },
            "query-input": "required name=search_term_string"
        }
    };

    // Educational Platform Schema
    const educationalSchema = {
        "@context": "https://schema.org",
        "@type": "EducationalOrganization",
        "name": "AptitudePro",
        "url": "https://www.aptitudepro.in",
        "logo": "https://www.aptitudepro.in/images/logo-main.svg",
        "description": "Online platform for aptitude test preparation",
        "offers": [
            {
                "@type": "Course",
                "name": "IT Jobs Aptitude Practice",
                "description": "Practice questions for IT recruitment exams",
                "url": "https://www.aptitudepro.in/?exam=it"
            },
            {
                "@type": "Course",
                "name": "Banking Exams Practice",
                "description": "Prepare for banking sector competitive exams",
                "url": "https://www.aptitudepro.in/?exam=banking"
            },
            {
                "@type": "Course",
                "name": "Government Jobs Practice",
                "description": "Practice for government sector recruitment exams",
                "url": "https://www.aptitudepro.in/?exam=government"
            }
        ]
    };

    // BreadcrumbList Schema
    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://www.aptitudepro.in/"
            },
            {
                "@type": "ListItem",
                "position": 2,
                "name": "Practice",
                "item": "https://www.aptitudepro.in/app.html"
            },
            {
                "@type": "ListItem",
                "position": 3,
                "name": "Exams",
                "item": "https://www.aptitudepro.in/#exams"
            }
        ]
    };

    // Add all schemas to the page
    const schemas = [
        organizationSchema,
        websiteSchema,
        educationalSchema,
        breadcrumbSchema
    ];

    schemas.forEach(schema => {
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify(schema);
        document.head.appendChild(script);
    });

    // Preload font for performance
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'font';
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap';
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
}

// Run when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addStructuredData);
} else {
    addStructuredData();
}
