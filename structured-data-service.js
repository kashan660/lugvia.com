class StructuredDataService {
    constructor() {
        this.domain = process.env.DOMAIN || 'https://lugvia.com';
        this.companyInfo = {
            name: 'Lugvia',
            description: 'Professional moving and relocation services',
            url: this.domain,
            logo: `${this.domain}/logo.svg`,
            telephone: '+1-555-LUGVIA',
            email: 'info@lugvia.com',
            address: {
                streetAddress: '123 Moving Street',
                addressLocality: 'Your City',
                addressRegion: 'Your State',
                postalCode: '12345',
                addressCountry: 'US'
            },
            sameAs: [
                'https://www.facebook.com/lugvia',
                'https://www.twitter.com/lugvia',
                'https://www.linkedin.com/company/lugvia',
                'https://www.instagram.com/lugvia'
            ]
        };
    }

    // Generate organization schema
    generateOrganizationSchema() {
        return {
            "@context": "https://schema.org",
            "@type": "MovingCompany",
            "name": this.companyInfo.name,
            "description": this.companyInfo.description,
            "url": this.companyInfo.url,
            "logo": {
                "@type": "ImageObject",
                "url": this.companyInfo.logo,
                "width": 200,
                "height": 60
            },
            "contactPoint": {
                "@type": "ContactPoint",
                "telephone": this.companyInfo.telephone,
                "contactType": "customer service",
                "availableLanguage": ["English"],
                "areaServed": "US"
            },
            "address": {
                "@type": "PostalAddress",
                "streetAddress": this.companyInfo.address.streetAddress,
                "addressLocality": this.companyInfo.address.addressLocality,
                "addressRegion": this.companyInfo.address.addressRegion,
                "postalCode": this.companyInfo.address.postalCode,
                "addressCountry": this.companyInfo.address.addressCountry
            },
            "sameAs": this.companyInfo.sameAs,
            "serviceArea": {
                "@type": "GeoCircle",
                "geoMidpoint": {
                    "@type": "GeoCoordinates",
                    "latitude": 40.7128,
                    "longitude": -74.0060
                },
                "geoRadius": 100000
            },
            "hasOfferCatalog": {
                "@type": "OfferCatalog",
                "name": "Moving Services",
                "itemListElement": [
                    {
                        "@type": "Offer",
                        "itemOffered": {
                            "@type": "Service",
                            "name": "Local Moving",
                            "description": "Professional local moving services within the city"
                        }
                    },
                    {
                        "@type": "Offer",
                        "itemOffered": {
                            "@type": "Service",
                            "name": "Long Distance Moving",
                            "description": "Reliable long-distance moving services across states"
                        }
                    },
                    {
                        "@type": "Offer",
                        "itemOffered": {
                            "@type": "Service",
                            "name": "Packing Services",
                            "description": "Professional packing and unpacking services"
                        }
                    },
                    {
                        "@type": "Offer",
                        "itemOffered": {
                            "@type": "Service",
                            "name": "Storage Solutions",
                            "description": "Secure storage solutions for your belongings"
                        }
                    }
                ]
            }
        };
    }

    // Generate website schema
    generateWebsiteSchema() {
        return {
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": this.companyInfo.name,
            "url": this.companyInfo.url,
            "description": this.companyInfo.description,
            "publisher": {
                "@type": "Organization",
                "name": this.companyInfo.name,
                "logo": {
                    "@type": "ImageObject",
                    "url": this.companyInfo.logo
                }
            },
            "potentialAction": {
                "@type": "SearchAction",
                "target": {
                    "@type": "EntryPoint",
                    "urlTemplate": `${this.domain}/search?q={search_term_string}`
                },
                "query-input": "required name=search_term_string"
            }
        };
    }

    // Generate service schema
    generateServiceSchema(service) {
        return {
            "@context": "https://schema.org",
            "@type": "Service",
            "name": service.name,
            "description": service.description,
            "provider": {
                "@type": "MovingCompany",
                "name": this.companyInfo.name,
                "url": this.companyInfo.url
            },
            "serviceType": "Moving Service",
            "areaServed": {
                "@type": "Country",
                "name": "United States"
            },
            "hasOfferCatalog": {
                "@type": "OfferCatalog",
                "name": service.name,
                "itemListElement": [
                    {
                        "@type": "Offer",
                        "itemOffered": {
                            "@type": "Service",
                            "name": service.name,
                            "description": service.description
                        },
                        "priceRange": service.priceRange || "$$",
                        "availability": "https://schema.org/InStock"
                    }
                ]
            }
        };
    }

    // Generate FAQ schema
    generateFAQSchema(faqs) {
        return {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": faqs.map(faq => ({
                "@type": "Question",
                "name": faq.question,
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": faq.answer
                }
            }))
        };
    }

    // Generate breadcrumb schema
    generateBreadcrumbSchema(breadcrumbs) {
        return {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": breadcrumbs.map((crumb, index) => ({
                "@type": "ListItem",
                "position": index + 1,
                "name": crumb.name,
                "item": `${this.domain}${crumb.url}`
            }))
        };
    }

    // Generate article schema for blog posts
    generateArticleSchema(article) {
        return {
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": article.title,
            "description": article.description,
            "image": article.image ? `${this.domain}${article.image}` : `${this.domain}/hero-image.png`,
            "author": {
                "@type": "Person",
                "name": article.author || "Lugvia Team"
            },
            "publisher": {
                "@type": "Organization",
                "name": this.companyInfo.name,
                "logo": {
                    "@type": "ImageObject",
                    "url": this.companyInfo.logo
                }
            },
            "datePublished": article.datePublished,
            "dateModified": article.dateModified || article.datePublished,
            "mainEntityOfPage": {
                "@type": "WebPage",
                "@id": `${this.domain}/blog/${article.slug}`
            }
        };
    }

    // Generate local business schema
    generateLocalBusinessSchema() {
        return {
            "@context": "https://schema.org",
            "@type": "MovingCompany",
            "name": this.companyInfo.name,
            "image": this.companyInfo.logo,
            "description": this.companyInfo.description,
            "url": this.companyInfo.url,
            "telephone": this.companyInfo.telephone,
            "email": this.companyInfo.email,
            "address": {
                "@type": "PostalAddress",
                "streetAddress": this.companyInfo.address.streetAddress,
                "addressLocality": this.companyInfo.address.addressLocality,
                "addressRegion": this.companyInfo.address.addressRegion,
                "postalCode": this.companyInfo.address.postalCode,
                "addressCountry": this.companyInfo.address.addressCountry
            },
            "geo": {
                "@type": "GeoCoordinates",
                "latitude": 40.7128,
                "longitude": -74.0060
            },
            "openingHoursSpecification": [
                {
                    "@type": "OpeningHoursSpecification",
                    "dayOfWeek": [
                        "Monday",
                        "Tuesday",
                        "Wednesday",
                        "Thursday",
                        "Friday"
                    ],
                    "opens": "08:00",
                    "closes": "18:00"
                },
                {
                    "@type": "OpeningHoursSpecification",
                    "dayOfWeek": "Saturday",
                    "opens": "09:00",
                    "closes": "16:00"
                }
            ],
            "sameAs": this.companyInfo.sameAs,
            "priceRange": "$$"
        };
    }

    // Generate review schema
    generateReviewSchema(reviews) {
        return {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": this.companyInfo.name,
            "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": this.calculateAverageRating(reviews),
                "reviewCount": reviews.length,
                "bestRating": "5",
                "worstRating": "1"
            },
            "review": reviews.map(review => ({
                "@type": "Review",
                "author": {
                    "@type": "Person",
                    "name": review.author
                },
                "reviewRating": {
                    "@type": "Rating",
                    "ratingValue": review.rating,
                    "bestRating": "5",
                    "worstRating": "1"
                },
                "reviewBody": review.text,
                "datePublished": review.date
            }))
        };
    }

    // Generate contact page schema
    generateContactPageSchema() {
        return {
            "@context": "https://schema.org",
            "@type": "ContactPage",
            "name": "Contact Lugvia",
            "description": "Get in touch with Lugvia for your moving needs",
            "url": `${this.domain}/contact.html`,
            "mainEntity": {
                "@type": "MovingCompany",
                "name": this.companyInfo.name,
                "contactPoint": {
                    "@type": "ContactPoint",
                    "telephone": this.companyInfo.telephone,
                    "email": this.companyInfo.email,
                    "contactType": "customer service",
                    "availableLanguage": ["English"]
                }
            }
        };
    }

    // Generate combined schema for homepage
    generateHomepageSchema() {
        return [
            this.generateOrganizationSchema(),
            this.generateWebsiteSchema(),
            this.generateLocalBusinessSchema()
        ];
    }

    // Utility function to calculate average rating
    calculateAverageRating(reviews) {
        if (!reviews || reviews.length === 0) return "5";
        const sum = reviews.reduce((acc, review) => acc + parseFloat(review.rating), 0);
        return (sum / reviews.length).toFixed(1);
    }

    // Generate schema markup for any page
    generateSchemaForPage(pageType, data = {}) {
        switch (pageType) {
            case 'homepage':
                return this.generateHomepageSchema();
            case 'service':
                return this.generateServiceSchema(data);
            case 'article':
                return this.generateArticleSchema(data);
            case 'faq':
                return this.generateFAQSchema(data.faqs);
            case 'contact':
                return this.generateContactPageSchema();
            case 'reviews':
                return this.generateReviewSchema(data.reviews);
            default:
                return this.generateWebsiteSchema();
        }
    }

    // Convert schema to JSON-LD script tag
    toJsonLdScript(schema) {
        const schemaArray = Array.isArray(schema) ? schema : [schema];
        return schemaArray.map(s => 
            `<script type="application/ld+json">${JSON.stringify(s, null, 2)}</script>`
        ).join('\n');
    }
}

module.exports = StructuredDataService;