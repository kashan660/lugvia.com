class AdminPanel {
    constructor() {
        this.data = {
            blogs: [
                {
                    id: 1,
                    title: "10 Tips for a Stress-Free Move",
                    author: "Sarah Johnson",
                    excerpt: "Moving doesn't have to be overwhelming. Here are our top tips...",
                    content: "Moving to a new home can be one of life's most stressful experiences...",
                    image: "https://via.placeholder.com/400x200",
                    status: "published",
                    date: new Date().toISOString()
                },
                {
                    id: 2,
                    title: "How to Pack Fragile Items",
                    author: "Mike Chen",
                    excerpt: "Protect your valuable items during the move with these packing techniques...",
                    content: "When it comes to moving fragile items, proper packing is essential...",
                    image: "https://via.placeholder.com/400x200",
                    status: "draft",
                    date: new Date().toISOString()
                }
            ],
            services: [
                {
                    id: 1,
                    name: "Local Moving",
                    description: "Professional local moving services within the city",
                    basePrice: 299.99,
                    features: ["Professional movers", "Basic insurance", "Loading/unloading"],
                    status: "active",
                    date: new Date().toISOString()
                },
                {
                    id: 2,
                    name: "Long Distance Moving",
                    description: "Interstate and long-distance moving services",
                    basePrice: 899.99,
                    features: ["Professional movers", "Full insurance", "Tracking", "Storage options"],
                    status: "active",
                    date: new Date().toISOString()
                }
            ],
            quotes: [
                {
                    id: 1,
                    customerName: "John Doe",
                    email: "john@example.com",
                    phone: "(555) 123-4567",
                    fromCity: "New York",
                    toCity: "Los Angeles",
                    homeSize: "3-bedroom",
                    moveDate: new Date().toISOString(),
                    services: ["packing", "insurance"],
                    status: "pending",
                    date: new Date().toISOString()
                },
                {
                    id: 2,
                    customerName: "Jane Smith",
                    email: "jane@example.com",
                    phone: "(555) 987-6543",
                    fromCity: "Chicago",
                    toCity: "Miami",
                    homeSize: "2-bedroom",
                    moveDate: new Date().toISOString(),
                    services: ["storage"],
                    status: "responded",
                    date: new Date().toISOString()
                }
            ],
            customers: [
                {
                    id: 1,
                    name: "John Doe",
                    email: "john@example.com",
                    phone: "(555) 123-4567",
                    address: "123 Main St, New York, NY",
                    joinDate: new Date().toISOString()
                },
                {
                    id: 2,
                    name: "Jane Smith",
                    email: "jane@example.com",
                    phone: "(555) 987-6543",
                    address: "456 Oak Ave, Chicago, IL",
                    joinDate: new Date().toISOString()
                }
            ],
            pricing: [
                {
                    id: 1,
                    serviceType: "Local Moving",
                    baseRate: 299.99,
                    perMile: 2.50,
                    status: "active"
                },
                {
                    id: 2,
                    serviceType: "Long Distance",
                    baseRate: 899.99,
                    perMile: 3.75,
                    status: "active"
                }
            ],
            tickets: [
                {
                    id: 1,
                    customerName: "John Doe",
                    email: "john@example.com",
                    phone: "(555) 123-4567",
                    subject: "Issue with moving quote",
                    category: "quote",
                    priority: "high",
                    status: "open",
                    description: "I received a quote but the pricing seems incorrect. Can you please review?",
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    responses: []
                },
                {
                    id: 2,
                    customerName: "Jane Smith",
                    email: "jane@example.com",
                    phone: "(555) 987-6543",
                    subject: "Scheduling conflict",
                    category: "booking",
                    priority: "medium",
                    status: "in-progress",
                    description: "Need to reschedule my move due to unexpected circumstances.",
                    createdAt: new Date(Date.now() - 86400000).toISOString(),
                    updatedAt: new Date().toISOString(),
                    responses: [
                        {
                            id: 1,
                            message: "We can help you reschedule. What dates work better for you?",
                            author: "Support Team",
                            timestamp: new Date().toISOString()
                        }
                    ]
                },
                {
                    id: 3,
                    customerName: "Mike Johnson",
                    email: "mike@example.com",
                    phone: "(555) 456-7890",
                    subject: "Damaged items during move",
                    category: "complaint",
                    priority: "critical",
                    status: "resolved",
                    description: "Some of my furniture was damaged during the move. I need to file a claim.",
                    createdAt: new Date(Date.now() - 172800000).toISOString(),
                    updatedAt: new Date(Date.now() - 86400000).toISOString(),
                    responses: [
                        {
                            id: 1,
                            message: "We apologize for the damage. Please send photos and we'll process your claim immediately.",
                            author: "Support Team",
                            timestamp: new Date(Date.now() - 86400000).toISOString()
                        },
                        {
                            id: 2,
                            message: "Claim has been processed and compensation will be sent within 3-5 business days.",
                            author: "Claims Department",
                            timestamp: new Date(Date.now() - 43200000).toISOString()
                        }
                    ]
                }
            ]
        };
        this.saveData();
        
        // Initialize password change form event listeners
        this.initPasswordChangeListeners();
    }
    
    initPasswordChangeListeners() {
        // Add event listener for password change form
        const changePasswordForm = document.getElementById('changePasswordForm');
        if (changePasswordForm) {
            changePasswordForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.changePassword();
            });
        }
        
        // Add event listeners for password strength checking
        const newPasswordInput = document.getElementById('newPassword');
        if (newPasswordInput) {
            newPasswordInput.addEventListener('input', (e) => {
                this.updatePasswordStrength(e.target.value);
            });
            
            newPasswordInput.addEventListener('focus', () => {
                document.querySelector('.password-strength').style.display = 'block';
            });
            
            newPasswordInput.addEventListener('blur', () => {
                setTimeout(() => {
                    this.hidePasswordStrength();
                }, 200);
            });
        }
    }

    // Blog Management
    renderBlogs() {
        const tbody = document.getElementById('blogsTableBody');
        tbody.innerHTML = this.data.blogs.map(blog => `
            <tr>
                <td>${blog.id}</td>
                <td>${blog.title}</td>
                <td>${blog.author}</td>
                <td>${new Date(blog.date).toLocaleDateString()}</td>
                <td><span class="status-badge status-${blog.status}">${blog.status}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-warning" onclick="adminPanel.editBlog(${blog.id})">Edit</button>
                        <button class="btn btn-sm btn-danger" onclick="adminPanel.deleteBlog(${blog.id})">Delete</button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    addBlog() {
        const form = document.getElementById('addBlogForm');
        const formData = new FormData(form);
        
        const blog = {
            id: Date.now(),
            title: document.getElementById('blogTitle').value,
            author: document.getElementById('blogAuthor').value,
            excerpt: document.getElementById('blogExcerpt').value,
            content: document.getElementById('blogContent').value,
            image: document.getElementById('blogImage').value,
            status: document.getElementById('blogStatus').value,
            date: new Date().toISOString()
        };

        this.data.blogs.push(blog);
        this.saveData();
        this.renderBlogs();
        this.updateDashboard();
        this.closeModal('addBlogModal');
        form.reset();
        this.showNotification('Blog post added successfully!', 'success');
    }

    editBlog(id) {
        const blog = this.data.blogs.find(b => b.id === id);
        if (!blog) return;

        const modalBody = document.getElementById('editModalBody');
        modalBody.innerHTML = `
            <form id="editBlogForm">
                <div class="form-group">
                    <label for="editBlogTitle">Title *</label>
                    <input type="text" id="editBlogTitle" value="${blog.title}" required>
                </div>
                <div class="form-group">
                    <label for="editBlogAuthor">Author *</label>
                    <input type="text" id="editBlogAuthor" value="${blog.author}" required>
                </div>
                <div class="form-group">
                    <label for="editBlogExcerpt">Excerpt</label>
                    <textarea id="editBlogExcerpt" rows="3">${blog.excerpt}</textarea>
                </div>
                <div class="form-group">
                    <label for="editBlogContent">Content *</label>
                    <textarea id="editBlogContent" rows="10" required>${blog.content}</textarea>
                </div>
                <div class="form-group">
                    <label for="editBlogImage">Featured Image URL</label>
                    <input type="url" id="editBlogImage" value="${blog.image}">
                </div>
                <div class="form-group">
                    <label for="editBlogStatus">Status</label>
                    <select id="editBlogStatus">
                        <option value="draft" ${blog.status === 'draft' ? 'selected' : ''}>Draft</option>
                        <option value="published" ${blog.status === 'published' ? 'selected' : ''}>Published</option>
                    </select>
                </div>
                <div class="modal-actions">
                    <button type="button" class="btn btn-secondary" onclick="adminPanel.closeModal('editModal')">Cancel</button>
                    <button type="submit" class="btn btn-primary">Update Blog Post</button>
                </div>
            </form>
        `;

        document.getElementById('editModalTitle').textContent = 'Edit Blog Post';
        document.getElementById('editModal').style.display = 'block';

        document.getElementById('editBlogForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.updateBlog(id);
        });
    }

    updateBlog(id) {
        const blogIndex = this.data.blogs.findIndex(b => b.id === id);
        if (blogIndex === -1) return;

        this.data.blogs[blogIndex] = {
            ...this.data.blogs[blogIndex],
            title: document.getElementById('editBlogTitle').value,
            author: document.getElementById('editBlogAuthor').value,
            excerpt: document.getElementById('editBlogExcerpt').value,
            content: document.getElementById('editBlogContent').value,
            image: document.getElementById('editBlogImage').value,
            status: document.getElementById('editBlogStatus').value
        };

        this.saveData();
        this.renderBlogs();
        this.closeModal('editModal');
        this.showNotification('Blog post updated successfully!', 'success');
    }

    deleteBlog(id) {
        const blog = this.data.blogs.find(b => b.id === id);
        if (!blog) return;

        document.getElementById('deleteMessage').textContent = `Are you sure you want to delete the blog post "${blog.title}"?`;
        document.getElementById('deleteModal').style.display = 'block';

        document.getElementById('confirmDeleteBtn').onclick = () => {
            this.data.blogs = this.data.blogs.filter(b => b.id !== id);
            this.saveData();
            this.renderBlogs();
            this.updateDashboard();
            this.closeModal('deleteModal');
            this.showNotification('Blog post deleted successfully!', 'success');
        };
    }

    // Service Management
    renderServices() {
        const tbody = document.getElementById('servicesTableBody');
        tbody.innerHTML = this.data.services.map(service => `
            <tr>
                <td>${service.id}</td>
                <td>${service.name}</td>
                <td>${service.description.substring(0, 50)}...</td>
                <td>$${service.basePrice}</td>
                <td><span class="status-badge status-${service.status}">${service.status}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-warning" onclick="adminPanel.editService(${service.id})">Edit</button>
                        <button class="btn btn-sm btn-danger" onclick="adminPanel.deleteService(${service.id})">Delete</button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    addService() {
        const service = {
            id: Date.now(),
            name: document.getElementById('serviceName').value,
            description: document.getElementById('serviceDescription').value,
            basePrice: parseFloat(document.getElementById('serviceBasePrice').value),
            features: document.getElementById('serviceFeatures').value.split(',').map(f => f.trim()),
            status: document.getElementById('serviceStatus').value,
            date: new Date().toISOString()
        };

        this.data.services.push(service);
        this.saveData();
        this.renderServices();
        this.updateDashboard();
        this.closeModal('addServiceModal');
        document.getElementById('addServiceForm').reset();
        this.showNotification('Service added successfully!', 'success');
    }

    editService(id) {
        const service = this.data.services.find(s => s.id === id);
        if (!service) return;

        const modalBody = document.getElementById('editModalBody');
        modalBody.innerHTML = `
            <form id="editServiceForm">
                <div class="form-group">
                    <label for="editServiceName">Service Name *</label>
                    <input type="text" id="editServiceName" value="${service.name}" required>
                </div>
                <div class="form-group">
                    <label for="editServiceDescription">Description *</label>
                    <textarea id="editServiceDescription" rows="4" required>${service.description}</textarea>
                </div>
                <div class="form-group">
                    <label for="editServiceBasePrice">Base Price ($) *</label>
                    <input type="number" id="editServiceBasePrice" step="0.01" value="${service.basePrice}" required>
                </div>
                <div class="form-group">
                    <label for="editServiceFeatures">Features (comma-separated)</label>
                    <textarea id="editServiceFeatures" rows="3">${service.features.join(', ')}</textarea>
                </div>
                <div class="form-group">
                    <label for="editServiceStatus">Status</label>
                    <select id="editServiceStatus">
                        <option value="active" ${service.status === 'active' ? 'selected' : ''}>Active</option>
                        <option value="inactive" ${service.status === 'inactive' ? 'selected' : ''}>Inactive</option>
                    </select>
                </div>
                <div class="modal-actions">
                    <button type="button" class="btn btn-secondary" onclick="adminPanel.closeModal('editModal')">Cancel</button>
                    <button type="submit" class="btn btn-primary">Update Service</button>
                </div>
            </form>
        `;

        document.getElementById('editModalTitle').textContent = 'Edit Service';
        document.getElementById('editModal').style.display = 'block';

        document.getElementById('editServiceForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.updateService(id);
        });
    }

    updateService(id) {
        const serviceIndex = this.data.services.findIndex(s => s.id === id);
        if (serviceIndex === -1) return;

        this.data.services[serviceIndex] = {
            ...this.data.services[serviceIndex],
            name: document.getElementById('editServiceName').value,
            description: document.getElementById('editServiceDescription').value,
            basePrice: parseFloat(document.getElementById('editServiceBasePrice').value),
            features: document.getElementById('editServiceFeatures').value.split(',').map(f => f.trim()),
            status: document.getElementById('editServiceStatus').value
        };

        this.saveData();
        this.renderServices();
        this.closeModal('editModal');
        this.showNotification('Service updated successfully!', 'success');
    }

    deleteService(id) {
        const service = this.data.services.find(s => s.id === id);
        if (!service) return;

        document.getElementById('deleteMessage').textContent = `Are you sure you want to delete the service "${service.name}"?`;
        document.getElementById('deleteModal').style.display = 'block';

        document.getElementById('confirmDeleteBtn').onclick = () => {
            this.data.services = this.data.services.filter(s => s.id !== id);
            this.saveData();
            this.renderServices();
            this.updateDashboard();
            this.closeModal('deleteModal');
            this.showNotification('Service deleted successfully!', 'success');
        };
    }

    // Quote Management
    renderQuotes() {
        const tbody = document.getElementById('quotesTableBody');
        tbody.innerHTML = this.data.quotes.map(quote => `
            <tr>
                <td>${quote.id}</td>
                <td>${quote.customerName}</td>
                <td>${quote.fromCity}</td>
                <td>${quote.toCity}</td>
                <td>${new Date(quote.date).toLocaleDateString()}</td>
                <td><span class="status-badge status-${quote.status}">${quote.status}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-primary" onclick="adminPanel.viewQuote(${quote.id})">View</button>
                        <button class="btn btn-sm btn-success" onclick="adminPanel.respondToQuote(${quote.id})">Respond</button>
                        <button class="btn btn-sm btn-danger" onclick="adminPanel.deleteQuote(${quote.id})">Delete</button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    filterQuotes(status) {
        const filteredQuotes = status === 'all' ? this.data.quotes : this.data.quotes.filter(q => q.status === status);
        const tbody = document.getElementById('quotesTableBody');
        tbody.innerHTML = filteredQuotes.map(quote => `
            <tr>
                <td>${quote.id}</td>
                <td>${quote.customerName}</td>
                <td>${quote.fromCity}</td>
                <td>${quote.toCity}</td>
                <td>${new Date(quote.date).toLocaleDateString()}</td>
                <td><span class="status-badge status-${quote.status}">${quote.status}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-primary" onclick="adminPanel.viewQuote(${quote.id})">View</button>
                        <button class="btn btn-sm btn-success" onclick="adminPanel.respondToQuote(${quote.id})">Respond</button>
                        <button class="btn btn-sm btn-danger" onclick="adminPanel.deleteQuote(${quote.id})">Delete</button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    viewQuote(id) {
        const quote = this.data.quotes.find(q => q.id === id);
        if (!quote) return;

        const modalBody = document.getElementById('editModalBody');
        modalBody.innerHTML = `
            <div class="quote-details">
                <h3>Quote Request Details</h3>
                <div class="form-group">
                    <label>Customer Name:</label>
                    <p>${quote.customerName}</p>
                </div>
                <div class="form-group">
                    <label>Email:</label>
                    <p>${quote.email}</p>
                </div>
                <div class="form-group">
                    <label>Phone:</label>
                    <p>${quote.phone}</p>
                </div>
                <div class="form-group">
                    <label>From:</label>
                    <p>${quote.fromCity}</p>
                </div>
                <div class="form-group">
                    <label>To:</label>
                    <p>${quote.toCity}</p>
                </div>
                <div class="form-group">
                    <label>Home Size:</label>
                    <p>${quote.homeSize}</p>
                </div>
                <div class="form-group">
                    <label>Move Date:</label>
                    <p>${new Date(quote.moveDate).toLocaleDateString()}</p>
                </div>
                <div class="form-group">
                    <label>Additional Services:</label>
                    <p>${quote.services.join(', ') || 'None'}</p>
                </div>
                <div class="form-group">
                    <label>Status:</label>
                    <p><span class="status-badge status-${quote.status}">${quote.status}</span></p>
                </div>
            </div>
            <div class="modal-actions">
                <button type="button" class="btn btn-secondary" onclick="adminPanel.closeModal('editModal')">Close</button>
                <button type="button" class="btn btn-success" onclick="adminPanel.respondToQuote(${quote.id})">Respond to Quote</button>
            </div>
        `;

        document.getElementById('editModalTitle').textContent = 'Quote Request Details';
        document.getElementById('editModal').style.display = 'block';
    }

    respondToQuote(id) {
        const quote = this.data.quotes.find(q => q.id === id);
        if (!quote) return;

        // Update quote status
        const quoteIndex = this.data.quotes.findIndex(q => q.id === id);
        this.data.quotes[quoteIndex].status = 'responded';
        this.saveData();
        this.renderQuotes();
        this.closeModal('editModal');
        this.showNotification('Quote marked as responded!', 'success');
    }

    deleteQuote(id) {
        const quote = this.data.quotes.find(q => q.id === id);
        if (!quote) return;

        document.getElementById('deleteMessage').textContent = `Are you sure you want to delete the quote request from ${quote.customerName}?`;
        document.getElementById('deleteModal').style.display = 'block';

        document.getElementById('confirmDeleteBtn').onclick = () => {
            this.data.quotes = this.data.quotes.filter(q => q.id !== id);
            this.saveData();
            this.renderQuotes();
            this.updateDashboard();
            this.closeModal('deleteModal');
            this.showNotification('Quote request deleted successfully!', 'success');
        };
    }

    // Customer Management
    renderCustomers() {
        const tbody = document.getElementById('customersTableBody');
        tbody.innerHTML = this.data.customers.map(customer => `
            <tr>
                <td>${customer.id}</td>
                <td>${customer.name}</td>
                <td>${customer.email}</td>
                <td>${customer.phone}</td>
                <td>${new Date(customer.joinDate).toLocaleDateString()}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-primary" onclick="adminPanel.viewCustomer(${customer.id})">View</button>
                        <button class="btn btn-sm btn-warning" onclick="adminPanel.editCustomer(${customer.id})">Edit</button>
                        <button class="btn btn-sm btn-danger" onclick="adminPanel.deleteCustomer(${customer.id})">Delete</button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    // Pricing Management
    renderPricing() {
        const tbody = document.getElementById('pricingTableBody');
        tbody.innerHTML = this.data.pricing.map(price => `
            <tr>
                <td>${price.id}</td>
                <td>${price.serviceType}</td>
                <td>$${price.baseRate}</td>
                <td>$${price.perMile}</td>
                <td><span class="status-badge status-${price.status}">${price.status}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-warning" onclick="adminPanel.editPricing(${price.id})">Edit</button>
                        <button class="btn btn-sm btn-danger" onclick="adminPanel.deletePricing(${price.id})">Delete</button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    // Newsletter Management
    async renderNewsletter() {
        await this.updateNewsletterStats();
        await this.renderSubscribers();
    }

    async updateNewsletterStats() {
        try {
            const response = await fetch('/api/newsletter/subscribers', {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                const subscribers = data.subscribers || [];
                const activeSubscribers = subscribers.filter(sub => sub.status === 'active');
                
                document.getElementById('subscriberCount').textContent = subscribers.length;
                document.getElementById('activeSubscriberCount').textContent = activeSubscribers.length;
                document.getElementById('newslettersSent').textContent = this.data.newsletters.length;
            } else {
                console.error('Failed to fetch newsletter stats');
                // Fallback to localStorage for backward compatibility
                this.updateNewsletterStatsFromLocalStorage();
            }
        } catch (error) {
            console.error('Error fetching newsletter stats:', error);
            // Fallback to localStorage for backward compatibility
            this.updateNewsletterStatsFromLocalStorage();
        }
    }

    updateNewsletterStatsFromLocalStorage() {
        const subscribers = this.getSubscribersFromLocalStorage();
        const activeSubscribers = subscribers.filter(sub => sub.status === 'active');
        
        document.getElementById('subscriberCount').textContent = subscribers.length;
        document.getElementById('activeSubscriberCount').textContent = activeSubscribers.length;
        document.getElementById('newslettersSent').textContent = this.data.newsletters.length;
    }

    async renderSubscribers() {
        const tbody = document.getElementById('subscribersTableBody');
        
        try {
            const response = await fetch('/api/newsletter/subscribers', {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                const subscribers = data.subscribers || [];
                
                tbody.innerHTML = subscribers.map(subscriber => `
                    <tr>
                        <td>${subscriber.email}</td>
                        <td>${subscriber.name || 'N/A'}</td>
                        <td>${new Date(subscriber.subscribed_at).toLocaleDateString()}</td>
                        <td><span class="status ${subscriber.status}">${subscriber.status}</span></td>
                        <td>${subscriber.subscription_source || 'website'}</td>
                        <td>
                            <button class="btn btn-sm btn-danger" onclick="adminPanel.removeSubscriber('${subscriber.email}')">
                                <i class="fas fa-trash"></i> Remove
                            </button>
                        </td>
                    </tr>
                `).join('');
            } else {
                console.error('Failed to fetch subscribers');
                // Fallback to localStorage
                this.renderSubscribersFromLocalStorage();
            }
        } catch (error) {
            console.error('Error fetching subscribers:', error);
            // Fallback to localStorage
            this.renderSubscribersFromLocalStorage();
        }
    }

    renderSubscribersFromLocalStorage() {
        const tbody = document.getElementById('subscribersTableBody');
        const subscribers = this.getSubscribersFromLocalStorage();
        
        tbody.innerHTML = subscribers.map(subscriber => `
            <tr>
                <td>${subscriber.email}</td>
                <td>N/A</td>
                <td>${new Date(subscriber.subscribedDate).toLocaleDateString()}</td>
                <td><span class="status ${subscriber.status}">${subscriber.status}</span></td>
                <td>localStorage</td>
                <td>
                    <button class="btn btn-sm btn-danger" onclick="adminPanel.removeSubscriber('${subscriber.email}')">
                        <i class="fas fa-trash"></i> Remove
                    </button>
                </td>
            </tr>
        `).join('');
    }

    getSubscribersFromLocalStorage() {
        const stored = localStorage.getItem('lugvia_newsletter_subscribers');
        return stored ? JSON.parse(stored) : [];
    }

    async removeSubscriber(email) {
        try {
            const response = await fetch('/api/newsletter/unsubscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify({ email })
            });
            
            if (response.ok) {
                await this.renderSubscribers();
                await this.updateNewsletterStats();
                this.showNotification('Subscriber removed successfully', 'success');
            } else {
                const data = await response.json();
                this.showNotification(data.error || 'Failed to remove subscriber', 'error');
            }
        } catch (error) {
            console.error('Error removing subscriber:', error);
            this.showNotification('Error removing subscriber', 'error');
        }
    }

    // Notifications Management
    renderNotifications() {
        this.updateNotificationStats();
        this.renderNotificationHistory();
    }

    updateNotificationStats() {
        const notifications = this.data.notifications;
        const successRate = notifications.length > 0 ? 
            Math.round((notifications.filter(n => n.status === 'sent').length / notifications.length) * 100) : 100;
        const lastSent = notifications.length > 0 ? 
            new Date(Math.max(...notifications.map(n => new Date(n.sentDate)))).toLocaleDateString() : 'Never';
        
        document.getElementById('totalNotificationsSent').textContent = notifications.length;
        document.getElementById('notificationSuccessRate').textContent = successRate + '%';
        document.getElementById('lastNotificationSent').textContent = lastSent;
    }

    renderNotificationHistory() {
        const tbody = document.getElementById('notificationsTableBody');
        const notifications = this.data.notifications;
        
        tbody.innerHTML = notifications.map(notification => `
            <tr>
                <td>${notification.message.substring(0, 50)}${notification.message.length > 50 ? '...' : ''}</td>
                <td><span class="notification-type ${notification.type}">${notification.type}</span></td>
                <td>${new Date(notification.sentDate).toLocaleDateString()}</td>
                <td><span class="status ${notification.status}">${notification.status}</span></td>
                <td>
                    <button class="btn btn-sm btn-danger" onclick="adminPanel.deleteNotification('${notification.id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </td>
            </tr>
        `).join('');
    }

    deleteNotification(id) {
        this.data.notifications = this.data.notifications.filter(n => n.id !== id);
        this.saveData();
        this.renderNotificationHistory();
        this.updateNotificationStats();
        this.showNotification('Notification deleted successfully', 'success');
    }

    // Modal Functions
    showAddBlogModal() {
        document.getElementById('addBlogModal').style.display = 'block';
    }

    showAddServiceModal() {
        document.getElementById('addServiceModal').style.display = 'block';
    }

    showAddCustomerModal() {
        // Implementation for add customer modal
        this.showNotification('Add customer functionality coming soon!', 'info');
    }

    showAddPricingModal() {
        // Implementation for add pricing modal
        this.showNotification('Add pricing functionality coming soon!', 'info');
    }

    closeModal(modalId) {
        document.getElementById(modalId).style.display = 'none';
    }

    // Settings
    saveGeneralSettings() {
        const settings = {
            siteName: document.getElementById('siteName').value,
            siteTagline: document.getElementById('siteTagline').value,
            contactEmail: document.getElementById('contactEmail').value
        };

        localStorage.setItem('lugvia_general_settings', JSON.stringify(settings));
        this.showNotification('General settings saved successfully!', 'success');
    }

    saveApiSettings() {
        const apiSettings = {
            apiEndpoint: document.getElementById('apiEndpoint').value,
            apiKey: document.getElementById('apiKey').value
        };

        localStorage.setItem('lugvia_api_settings', JSON.stringify(apiSettings));
        this.showNotification('API settings saved successfully!', 'success');
    }

    // Data Management
    loadData() {
        // Load sample data or from localStorage
        const savedData = localStorage.getItem('lugvia_admin_data');
        if (savedData) {
            this.data = JSON.parse(savedData);
        } else {
            this.loadSampleData();
        }
    }

    saveData() {
        localStorage.setItem('lugvia_admin_data', JSON.stringify(this.data));
    }

    loadSampleData() {
        this.data = {
            blogs: [
                {
                    id: 1,
                    title: "10 Tips for a Stress-Free Move",
                    author: "Sarah Johnson",
                    excerpt: "Moving doesn't have to be overwhelming. Here are our top tips...",
                    content: "Moving to a new home can be one of life's most stressful experiences...",
                    image: "https://via.placeholder.com/400x200",
                    status: "published",
                    date: new Date().toISOString()
                },
                {
                    id: 2,
                    title: "How to Pack Fragile Items",
                    author: "Mike Chen",
                    excerpt: "Protect your valuable items during the move with these packing techniques...",
                    content: "When it comes to moving fragile items, proper packing is essential...",
                    image: "https://via.placeholder.com/400x200",
                    status: "draft",
                    date: new Date().toISOString()
                }
            ],
            services: [
                {
                    id: 1,
                    name: "Local Moving",
                    description: "Professional local moving services within the city",
                    basePrice: 299.99,
                    features: ["Professional movers", "Basic insurance", "Loading/unloading"],
                    status: "active",
                    date: new Date().toISOString()
                },
                {
                    id: 2,
                    name: "Long Distance Moving",
                    description: "Interstate and long-distance moving services",
                    basePrice: 899.99,
                    features: ["Professional movers", "Full insurance", "Tracking", "Storage options"],
                    status: "active",
                    date: new Date().toISOString()
                }
            ],
            quotes: [
                {
                    id: 1,
                    customerName: "John Doe",
                    email: "john@example.com",
                    phone: "(555) 123-4567",
                    fromCity: "New York",
                    toCity: "Los Angeles",
                    homeSize: "3-bedroom",
                    moveDate: new Date().toISOString(),
                    services: ["packing", "insurance"],
                    status: "pending",
                    date: new Date().toISOString()
                },
                {
                    id: 2,
                    customerName: "Jane Smith",
                    email: "jane@example.com",
                    phone: "(555) 987-6543",
                    fromCity: "Chicago",
                    toCity: "Miami",
                    homeSize: "2-bedroom",
                    moveDate: new Date().toISOString(),
                    services: ["storage"],
                    status: "responded",
                    date: new Date().toISOString()
                }
            ],
            customers: [
                {
                    id: 1,
                    name: "John Doe",
                    email: "john@example.com",
                    phone: "(555) 123-4567",
                    address: "123 Main St, New York, NY",
                    joinDate: new Date().toISOString()
                },
                {
                    id: 2,
                    name: "Jane Smith",
                    email: "jane@example.com",
                    phone: "(555) 987-6543",
                    address: "456 Oak Ave, Chicago, IL",
                    joinDate: new Date().toISOString()
                }
            ],
            pricing: [
                {
                    id: 1,
                    serviceType: "Local Moving",
                    baseRate: 299.99,
                    perMile: 2.50,
                    status: "active"
                },
                {
                    id: 2,
                    serviceType: "Long Distance",
                    baseRate: 899.99,
                    perMile: 3.75,
                    status: "active"
                }
            ],
            tickets: [
                {
                    id: 1,
                    customerName: "John Doe",
                    email: "john@example.com",
                    phone: "(555) 123-4567",
                    subject: "Issue with moving quote",
                    category: "quote",
                    priority: "high",
                    status: "open",
                    description: "I received a quote but the pricing seems incorrect. Can you please review?",
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    responses: []
                },
                {
                    id: 2,
                    customerName: "Jane Smith",
                    email: "jane@example.com",
                    phone: "(555) 987-6543",
                    subject: "Scheduling conflict",
                    category: "booking",
                    priority: "medium",
                    status: "in-progress",
                    description: "Need to reschedule my move due to unexpected circumstances.",
                    createdAt: new Date(Date.now() - 86400000).toISOString(),
                    updatedAt: new Date().toISOString(),
                    responses: [
                        {
                            id: 1,
                            message: "We can help you reschedule. What dates work better for you?",
                            author: "Support Team",
                            timestamp: new Date().toISOString()
                        }
                    ]
                },
                {
                    id: 3,
                    customerName: "Mike Johnson",
                    email: "mike@example.com",
                    phone: "(555) 456-7890",
                    subject: "Damaged items during move",
                    category: "complaint",
                    priority: "critical",
                    status: "resolved",
                    description: "Some of my furniture was damaged during the move. I need to file a claim.",
                    createdAt: new Date(Date.now() - 172800000).toISOString(),
                    updatedAt: new Date(Date.now() - 86400000).toISOString(),
                    responses: [
                        {
                            id: 1,
                            message: "We apologize for the damage. Please send photos and we'll process your claim immediately.",
                            author: "Support Team",
                            timestamp: new Date(Date.now() - 86400000).toISOString()
                        },
                        {
                            id: 2,
                            message: "Claim has been processed and compensation will be sent within 3-5 business days.",
                            author: "Claims Department",
                            timestamp: new Date(Date.now() - 43200000).toISOString()
                        }
                    ]
                }
            ]
        };
        this.saveData();
    }

    // Ticket Management Methods
    async renderTickets() {
        try {
            // Fetch tickets from API
            const response = await fetch('/api/tickets');
            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    this.data.tickets = result.data;
                }
            }
        } catch (error) {
            console.warn('Could not fetch tickets from API, using local data:', error);
        }
        
        const ticketsTableBody = document.getElementById('ticketsTableBody');
        if (!ticketsTableBody) return;

        const statusFilter = document.getElementById('ticketStatusFilter')?.value || 'all';
        const priorityFilter = document.getElementById('ticketPriorityFilter')?.value || 'all';
        const categoryFilter = document.getElementById('ticketCategoryFilter')?.value || 'all';

        let filteredTickets = this.data.tickets || [];

        if (statusFilter !== 'all') {
            filteredTickets = filteredTickets.filter(ticket => ticket.status === statusFilter);
        }
        if (priorityFilter !== 'all') {
            filteredTickets = filteredTickets.filter(ticket => ticket.priority === priorityFilter);
        }
        if (categoryFilter !== 'all') {
            filteredTickets = filteredTickets.filter(ticket => ticket.category === categoryFilter);
        }

        ticketsTableBody.innerHTML = filteredTickets.map(ticket => `
            <tr>
                <td>#${ticket.id}</td>
                <td>
                    <div>
                        <strong>${ticket.customerName}</strong><br>
                        <small>${ticket.email}</small>
                    </div>
                </td>
                <td>${ticket.subject}</td>
                <td>${this.getCategoryLabel(ticket.category)}</td>
                <td><span class="priority-badge ${ticket.priority}">${ticket.priority}</span></td>
                <td><span class="status-badge ${ticket.status}">${ticket.status.replace('-', ' ')}</span></td>
                <td>${new Date(ticket.createdAt).toLocaleDateString()}</td>
                <td>
                    <div class="ticket-actions">
                        <button class="btn btn-view" onclick="adminPanel.viewTicket(${ticket.id})" title="View Details">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-edit" onclick="adminPanel.updateTicketStatus(${ticket.id})" title="Update Status">
                            <i class="fas fa-edit"></i>
                        </button>
                        ${ticket.status !== 'closed' ? `
                            <button class="btn btn-close" onclick="adminPanel.closeTicket(${ticket.id})" title="Close Ticket">
                                <i class="fas fa-times"></i>
                            </button>
                        ` : ''}
                    </div>
                </td>
            </tr>
        `).join('');

        this.updateTicketStats();
    }

    updateTicketStats() {
        const tickets = this.data.tickets || [];
        
        const openTickets = tickets.filter(t => t.status === 'open').length;
        const inProgressTickets = tickets.filter(t => t.status === 'in-progress').length;
        const resolvedTickets = tickets.filter(t => t.status === 'resolved').length;
        const criticalTickets = tickets.filter(t => t.priority === 'critical' && t.status !== 'closed').length;

        document.getElementById('openTickets').textContent = openTickets;
        document.getElementById('inProgressTickets').textContent = inProgressTickets;
        document.getElementById('resolvedTickets').textContent = resolvedTickets;
        document.getElementById('criticalTickets').textContent = criticalTickets;
    }

    getCategoryLabel(category) {
        const labels = {
            'quote': 'Quote & Pricing',
            'booking': 'Booking & Scheduling',
            'moving': 'Moving Services',
            'billing': 'Billing & Payment',
            'technical': 'Technical Support',
            'complaint': 'Complaint',
            'other': 'Other'
        };
        return labels[category] || category;
    }

    viewTicket(id) {
        const ticket = this.data.tickets.find(t => t.id === id);
        if (!ticket) return;

        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 800px;">
                <div class="modal-header">
                    <h2>Ticket #${ticket.id} - ${ticket.subject}</h2>
                    <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="ticket-details">
                        <div class="ticket-info-grid">
                            <div class="info-item">
                                <label>Customer:</label>
                                <span>${ticket.customerName}</span>
                            </div>
                            <div class="info-item">
                                <label>Email:</label>
                                <span>${ticket.email}</span>
                            </div>
                            <div class="info-item">
                                <label>Phone:</label>
                                <span>${ticket.phone || 'Not provided'}</span>
                            </div>
                            <div class="info-item">
                                <label>Category:</label>
                                <span>${this.getCategoryLabel(ticket.category)}</span>
                            </div>
                            <div class="info-item">
                                <label>Priority:</label>
                                <span class="priority-badge ${ticket.priority}">${ticket.priority}</span>
                            </div>
                            <div class="info-item">
                                <label>Status:</label>
                                <span class="status-badge ${ticket.status}">${ticket.status.replace('-', ' ')}</span>
                            </div>
                            <div class="info-item">
                                <label>Created:</label>
                                <span>${new Date(ticket.createdAt).toLocaleString()}</span>
                            </div>
                            <div class="info-item">
                                <label>Last Updated:</label>
                                <span>${new Date(ticket.updatedAt).toLocaleString()}</span>
                            </div>
                        </div>
                        
                        <div class="ticket-description">
                            <h4>Description:</h4>
                            <p>${ticket.description}</p>
                        </div>
                        
                        <div class="ticket-responses">
                            <h4>Responses:</h4>
                            <div class="responses-list">
                                ${ticket.responses.map(response => `
                                    <div class="response-item">
                                        <div class="response-header">
                                            <strong>${response.author}</strong>
                                            <span class="response-time">${new Date(response.timestamp).toLocaleString()}</span>
                                        </div>
                                        <div class="response-message">${response.message}</div>
                                    </div>
                                `).join('')}
                            </div>
                            
                            <div class="add-response">
                                <h5>Add Response:</h5>
                                <textarea id="responseMessage" placeholder="Type your response here..." rows="3"></textarea>
                                <button class="btn btn-primary" onclick="adminPanel.addTicketResponse(${ticket.id})">
                                    <i class="fas fa-reply"></i> Send Response
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        modal.style.display = 'block';
    }

    async addTicketResponse(ticketId) {
        const message = document.getElementById('responseMessage').value.trim();
        if (!message) {
            this.showNotification('Please enter a response message', 'warning');
            return;
        }

        try {
            const response = await fetch(`/api/tickets/${ticketId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    response: message
                })
            });

            const result = await response.json();
            
            if (result.success) {
                this.showNotification('Response added successfully', 'success');
                
                // Refresh the modal
                document.querySelector('.modal').remove();
                this.viewTicket(ticketId);
                this.renderTickets();
            } else {
                throw new Error(result.error || 'Failed to add response');
            }
        } catch (error) {
            console.error('Error adding response:', error);
            
            // Fallback to local update
            const ticket = this.data.tickets.find(t => t.id === ticketId);
            if (ticket) {
                const response = {
                    id: ticket.responses.length + 1,
                    message: message,
                    author: 'Support Team',
                    timestamp: new Date().toISOString()
                };

                ticket.responses.push(response);
                ticket.updatedAt = new Date().toISOString();
                
                if (ticket.status === 'open') {
                    ticket.status = 'in-progress';
                }

                this.saveData();
                this.showNotification('Response added (offline mode)', 'warning');
                
                // Refresh the modal
                document.querySelector('.modal').remove();
                this.viewTicket(ticketId);
                this.renderTickets();
            } else {
                this.showNotification('Failed to add response', 'error');
            }
        }
    }

    updateTicketStatus(id) {
        const ticket = this.data.tickets.find(t => t.id === id);
        if (!ticket) return;

        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Update Ticket Status</h2>
                    <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label for="ticketStatus">Status:</label>
                        <select id="ticketStatus">
                            <option value="open" ${ticket.status === 'open' ? 'selected' : ''}>Open</option>
                            <option value="in-progress" ${ticket.status === 'in-progress' ? 'selected' : ''}>In Progress</option>
                            <option value="resolved" ${ticket.status === 'resolved' ? 'selected' : ''}>Resolved</option>
                            <option value="closed" ${ticket.status === 'closed' ? 'selected' : ''}>Closed</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="ticketPriority">Priority:</label>
                        <select id="ticketPriority">
                            <option value="low" ${ticket.priority === 'low' ? 'selected' : ''}>Low</option>
                            <option value="medium" ${ticket.priority === 'medium' ? 'selected' : ''}>Medium</option>
                            <option value="high" ${ticket.priority === 'high' ? 'selected' : ''}>High</option>
                            <option value="critical" ${ticket.priority === 'critical' ? 'selected' : ''}>Critical</option>
                        </select>
                    </div>
                    <button class="btn btn-primary" onclick="adminPanel.saveTicketUpdate(${id})">
                        <i class="fas fa-save"></i> Update Ticket
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        modal.style.display = 'block';
    }

    async saveTicketUpdate(id) {
        const newStatus = document.getElementById('ticketStatus').value;
        const newPriority = document.getElementById('ticketPriority').value;

        const updateData = {
            status: newStatus,
            priority: newPriority
        };

        try {
            const response = await fetch(`/api/tickets/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updateData)
            });

            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    this.showNotification('Ticket updated successfully', 'success');
                    document.querySelector('.modal').remove();
                    this.renderTickets();
                    return;
                }
            }
        } catch (error) {
            console.warn('Could not update ticket via API, updating locally:', error);
        }

        // Fallback to local update
        const ticket = this.data.tickets.find(t => t.id === id);
        if (ticket) {
            ticket.status = newStatus;
            ticket.priority = newPriority;
            ticket.updatedAt = new Date().toISOString();

            this.saveData();
            this.showNotification('Ticket updated locally', 'warning');
            document.querySelector('.modal').remove();
            this.renderTickets();
        }
    }

    async closeTicket(id) {
        if (!confirm('Are you sure you want to close this ticket?')) return;

        try {
            const response = await fetch(`/api/tickets/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: 'closed' })
            });

            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    this.renderTickets();
                    this.showNotification('Ticket closed successfully', 'success');
                    return;
                }
            }
        } catch (error) {
            console.warn('Could not close ticket via API, updating locally:', error);
        }

        // Fallback to local update
        const ticket = this.data.tickets.find(t => t.id === id);
        if (ticket) {
            ticket.status = 'closed';
            ticket.updatedAt = new Date().toISOString();

            this.saveData();
            this.renderTickets();
            this.showNotification('Ticket closed locally', 'warning');
        }
    }

    // Notifications
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span>${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">&times;</button>
            </div>
        `;

        // Add notification styles if not already present
        if (!document.querySelector('.notification-styles')) {
            const styles = document.createElement('style');
            styles.className = 'notification-styles';
            styles.textContent = `
                .notification {
                    position: fixed;
                    top: 100px;
                    right: 20px;
                    z-index: 3000;
                    min-width: 300px;
                    padding: 1rem;
                    border-radius: 8px;
                    color: white;
                    animation: slideInRight 0.3s ease;
                }
                .notification-success { background: #10b981; }
                .notification-error { background: #ef4444; }
                .notification-warning { background: #c2410c; }
                .notification-info { background: #3b82f6; }
                .notification-content {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .notification-close {
                    background: none;
                    border: none;
                    color: white;
                    font-size: 1.2rem;
                    cursor: pointer;
                    margin-left: 1rem;
                }
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(styles);
        }

        document.body.appendChild(notification);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    // WhatsApp Settings
    async saveWhatsAppSettings() {
        const formData = {
            whatsappNumber: document.getElementById('whatsappNumber').value,
            businessHours: document.getElementById('businessHours').value,
            defaultMessage: document.getElementById('defaultMessage').value,
            autoReply: document.getElementById('autoReply').value,
            enabled: document.getElementById('whatsappEnabled').checked
        };

        try {
            const response = await fetch('/api/admin/whatsapp-settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                this.showNotification('WhatsApp settings saved successfully!', 'success');
            } else {
                throw new Error('Failed to save settings');
            }
        } catch (error) {
            this.showNotification('Error saving WhatsApp settings: ' + error.message, 'error');
        }
    }

    // Analytics Settings
    async saveAnalyticsSettings() {
        const formData = {
            gaTrackingId: document.getElementById('gaTrackingId').value,
            gtmContainerId: document.getElementById('gtmContainerId').value,
            analyticsEnabled: document.getElementById('analyticsEnabled').checked,
            trackEvents: document.getElementById('trackEvents').checked
        };

        try {
            const response = await fetch('/api/admin/analytics-settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                this.showNotification('Analytics settings saved successfully!', 'success');
            } else {
                throw new Error('Failed to save settings');
            }
        } catch (error) {
            this.showNotification('Error saving analytics settings: ' + error.message, 'error');
        }
    }

    // SEO Meta Tags
    async saveMetaTags() {
        const formData = {
            siteTitle: document.getElementById('siteTitle').value,
            metaDescription: document.getElementById('metaDescription').value,
            metaKeywords: document.getElementById('metaKeywords').value
        };

        try {
            const response = await fetch('/api/admin/meta-tags', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                this.showNotification('Meta tags updated successfully!', 'success');
            } else {
                throw new Error('Failed to update meta tags');
            }
        } catch (error) {
            this.showNotification('Error updating meta tags: ' + error.message, 'error');
        }
    }

    // Search Console Settings
    async saveSearchConsoleSettings() {
        const formData = {
            googleSiteVerification: document.getElementById('googleSiteVerification').value,
            bingVerification: document.getElementById('bingVerification').value
        };

        try {
            const response = await fetch('/api/admin/search-console', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                this.showNotification('Search console settings saved successfully!', 'success');
            } else {
                throw new Error('Failed to save settings');
            }
        } catch (error) {
            this.showNotification('Error saving search console settings: ' + error.message, 'error');
        }
    }

    // CAPTCHA Settings
    async saveCaptchaSettings() {
        const formData = {
            recaptchaSiteKey: document.getElementById('recaptchaSiteKey').value,
            recaptchaSecretKey: document.getElementById('recaptchaSecretKey').value,
            captchaEnabled: document.getElementById('captchaEnabled').checked
        };

        try {
            const response = await fetch('/api/admin/captcha-settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                this.showNotification('CAPTCHA settings saved successfully!', 'success');
            } else {
                throw new Error('Failed to save settings');
            }
        } catch (error) {
            this.showNotification('Error saving CAPTCHA settings: ' + error.message, 'error');
        }
    }

    // Login Security Settings
    async saveLoginSecuritySettings() {
        const formData = {
            maxLoginAttempts: parseInt(document.getElementById('maxLoginAttempts').value),
            lockoutDuration: parseInt(document.getElementById('lockoutDuration').value),
            twoFactorEnabled: document.getElementById('twoFactorEnabled').checked
        };

        try {
            const response = await fetch('/api/admin/login-security', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                this.showNotification('Login security settings saved successfully!', 'success');
            } else {
                throw new Error('Failed to save settings');
            }
        } catch (error) {
            this.showNotification('Error saving login security settings: ' + error.message, 'error');
        }
    }

    // Cloudflare Settings
    async saveCloudflareSettings() {
        const formData = {
            cloudflareApiKey: document.getElementById('cloudflareApiKey').value,
            cloudflareEmail: document.getElementById('cloudflareEmail').value,
            cloudflareZoneId: document.getElementById('cloudflareZoneId').value,
            cloudflareEnabled: document.getElementById('cloudflareEnabled').checked
        };

        try {
            const response = await fetch('/api/admin/cloudflare-settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                this.showNotification('Cloudflare settings saved successfully!', 'success');
            } else {
                throw new Error('Failed to save settings');
            }
        } catch (error) {
            this.showNotification('Error saving Cloudflare settings: ' + error.message, 'error');
        }
    }

    // BIN Search
    async searchBIN() {
        const binNumber = document.getElementById('binNumber').value;
        if (!binNumber || binNumber.length < 6) {
            this.showNotification('Please enter at least 6 digits', 'error');
            return;
        }

        try {
            const response = await fetch(`/api/admin/bin-search/${binNumber}`);
            const data = await response.json();

            if (response.ok) {
                this.displayBinResults(data);
            } else {
                throw new Error(data.message || 'BIN search failed');
            }
        } catch (error) {
            this.showNotification('Error searching BIN: ' + error.message, 'error');
        }
    }

    displayBinResults(data) {
        document.getElementById('bankName').textContent = data.bank?.name || '-';
        document.getElementById('cardType').textContent = data.type || '-';
        document.getElementById('cardBrand').textContent = data.brand || '-';
        document.getElementById('country').textContent = data.country?.name || '-';
        document.getElementById('currency').textContent = data.country?.currency || '-';
        document.getElementById('binResults').style.display = 'block';
    }

    // BIN API Settings
    async saveBinApiSettings() {
        const formData = {
            binApiKey: document.getElementById('binApiKey').value,
            binApiProvider: document.getElementById('binApiProvider').value
        };

        try {
            const response = await fetch('/api/admin/bin-api-settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                this.showNotification('BIN API settings saved successfully!', 'success');
            } else {
                throw new Error('Failed to save settings');
            }
        } catch (error) {
            this.showNotification('Error saving BIN API settings: ' + error.message, 'error');
        }
    }

    // SMTP Settings
    async saveSmtpSettings() {
        const formData = {
            smtpHost: document.getElementById('smtpHost').value,
            smtpPort: parseInt(document.getElementById('smtpPort').value),
            smtpUsername: document.getElementById('smtpUsername').value,
            smtpPassword: document.getElementById('smtpPassword').value,
            smtpFromName: document.getElementById('smtpFromName').value,
            smtpFromEmail: document.getElementById('smtpFromEmail').value,
            smtpSecure: document.getElementById('smtpSecure').checked
        };

        try {
            const response = await fetch('/api/admin/smtp-settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                this.showNotification('SMTP settings saved successfully!', 'success');
            } else {
                throw new Error('Failed to save settings');
            }
        } catch (error) {
            this.showNotification('Error saving SMTP settings: ' + error.message, 'error');
        }
    }

    // Password Change Functionality
    async changePassword() {
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        // Validate passwords
        const validation = this.validatePasswordChange(currentPassword, newPassword, confirmPassword);
        if (!validation.isValid) {
            this.showNotification(validation.message, 'error');
            return;
        }

        try {
            // Get admin token from cookie
            const token = document.cookie.split('; ').find(row => row.startsWith('admin_token='))?.split('=')[1];
            
            const response = await fetch('/api/admin/change-password', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                credentials: 'include',
                body: JSON.stringify({
                    currentPassword,
                    newPassword
                })
            });

            const result = await response.json();

            if (result.success) {
                this.showNotification(result.message || 'Password changed successfully!', 'success');
                // Clear the form
                document.getElementById('changePasswordForm').reset();
                this.hidePasswordStrength();
            } else {
                this.showNotification(result.error || 'Failed to change password', 'error');
            }
        } catch (error) {
            this.showNotification('Error changing password: ' + error.message, 'error');
        }
    }

    validatePasswordChange(currentPassword, newPassword, confirmPassword) {
        // Check if all fields are filled
        if (!currentPassword || !newPassword || !confirmPassword) {
            return { isValid: false, message: 'Please fill in all password fields' };
        }

        // Check if new passwords match
        if (newPassword !== confirmPassword) {
            return { isValid: false, message: 'New passwords do not match' };
        }

        // Check password strength
        const strength = this.checkPasswordStrength(newPassword);
        if (strength.score < 2) {
            return { isValid: false, message: 'Password is too weak. Please choose a stronger password.' };
        }

        return { isValid: true, message: 'Password validation successful' };
    }

    checkPasswordStrength(password) {
        let score = 0;
        let feedback = [];

        // Length check
        if (password.length >= 8) score++;
        else feedback.push('At least 8 characters');

        // Uppercase check
        if (/[A-Z]/.test(password)) score++;
        else feedback.push('One uppercase letter');

        // Lowercase check
        if (/[a-z]/.test(password)) score++;
        else feedback.push('One lowercase letter');

        // Number check
        if (/\d/.test(password)) score++;
        else feedback.push('One number');

        // Special character check
        if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;
        else feedback.push('One special character');

        const strength = {
            score,
            level: score <= 1 ? 'weak' : score <= 2 ? 'fair' : score <= 3 ? 'good' : 'strong',
            feedback
        };

        return strength;
    }

    updatePasswordStrength(password) {
        const strengthIndicator = document.getElementById('passwordStrength');
        const strengthFill = document.getElementById('strengthFill');
        const strengthText = document.getElementById('strengthText');

        if (!password) {
            this.hidePasswordStrength();
            return;
        }

        const strength = this.checkPasswordStrength(password);
        
        // Show strength indicator
        strengthIndicator.style.display = 'block';

        // Update strength bar
        strengthFill.className = `strength-fill ${strength.level}`;
        
        // Update strength text
        strengthText.className = `strength-text ${strength.level}`;
        strengthText.textContent = `Password strength: ${strength.level.charAt(0).toUpperCase() + strength.level.slice(1)}`;
        
        if (strength.feedback.length > 0) {
            strengthText.textContent += ` (Missing: ${strength.feedback.join(', ')})`;
        }
    }

    hidePasswordStrength() {
        const strengthIndicator = document.getElementById('passwordStrength');
        if (strengthIndicator) {
            strengthIndicator.style.display = 'none';
        }
    }
}

// Global functions
async function logout() {
    if (confirm('Are you sure you want to logout?')) {
        try {
            // Call server-side logout to clear the admin_token cookie
            await fetch('/api/admin/logout', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        } catch (error) {
            console.error('Logout error:', error);
        }
        
        // Clear client-side session data
        localStorage.removeItem('lugvia_admin_session');
        sessionStorage.removeItem('lugvia_admin_session');
        
        // Redirect to login page
        window.location.href = 'admin-login.html';
    }
}

function closeModal(modalId) {
    adminPanel.closeModal(modalId);
}

function showAddBlogModal() {
    adminPanel.showAddBlogModal();
}

function showAddServiceModal() {
    adminPanel.showAddServiceModal();
}

function showAddCustomerModal() {
    adminPanel.showAddCustomerModal();
}

function showAddPricingModal() {
    adminPanel.showAddPricingModal();
}

function showSendNewsletterModal() {
    document.getElementById('sendNewsletterModal').style.display = 'block';
}

function showSendNotificationModal() {
    document.getElementById('sendNotificationModal').style.display = 'block';
}

function sendNewsletter() {
    const subject = document.getElementById('newsletterSubject').value;
    const content = document.getElementById('newsletterContent').value;
    const type = document.getElementById('newsletterType').value;
    
    if (!subject || !content) {
        adminPanel.showNotification('Please fill in all required fields', 'error');
        return;
    }
    
    const newsletter = {
        id: Date.now().toString(),
        subject: subject,
        content: content,
        type: type,
        sentDate: new Date().toISOString(),
        status: 'sent'
    };
    
    adminPanel.data.newsletters.push(newsletter);
    adminPanel.saveData();
    
    // Clear form
    document.getElementById('sendNewsletterForm').reset();
    closeModal('sendNewsletterModal');
    
    adminPanel.showNotification('Newsletter sent successfully!', 'success');
    adminPanel.updateNewsletterStats();
}

function sendNotification() {
    const message = document.getElementById('notificationMessage').value;
    const type = document.getElementById('notificationType').value;
    const duration = parseInt(document.getElementById('notificationDuration').value);
    
    if (!message) {
        adminPanel.showNotification('Please enter a notification message', 'error');
        return;
    }
    
    const notification = {
        id: Date.now().toString(),
        message: message,
        type: type,
        duration: duration,
        sentDate: new Date().toISOString(),
        status: 'sent'
    };
    
    adminPanel.data.notifications.push(notification);
    adminPanel.saveData();
    
    // Clear form
    document.getElementById('sendNotificationForm').reset();
    closeModal('sendNotificationModal');
    
    // Show the notification immediately
    adminPanel.showNotification(message, type);
    adminPanel.updateNotificationStats();
}

// SEO Functions
function generateSitemap() {
    adminPanel.showNotification('Generating sitemap...', 'info');
    fetch('/api/admin/generate-sitemap', { method: 'POST' })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                adminPanel.showNotification('Sitemap generated successfully!', 'success');
                document.getElementById('sitemapStatus').innerHTML = `<p>Sitemap generated at: ${new Date().toLocaleString()}</p>`;
            } else {
                throw new Error(data.message);
            }
        })
        .catch(error => {
            adminPanel.showNotification('Error generating sitemap: ' + error.message, 'error');
        });
}

function submitToGoogle() {
    adminPanel.showNotification('Submitting sitemap to Google...', 'info');
    // Implementation would go here
}

// Password functionality
function togglePasswordVisibility(fieldId) {
    const passwordInput = document.getElementById(fieldId);
    const toggleButton = passwordInput.nextElementSibling.querySelector('i');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleButton.className = 'fas fa-eye-slash';
    } else {
        passwordInput.type = 'password';
        toggleButton.className = 'fas fa-eye';
    }
}

// Navigation functionality
function initNavigation() {
    // Get all navigation links
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.admin-section');
    
    // Add click event listeners to navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Get the target section from data-section attribute
            const targetSection = this.getAttribute('data-section');
            
            // Remove active class from all links and sections
            navLinks.forEach(navLink => navLink.classList.remove('active'));
            sections.forEach(section => section.classList.remove('active'));
            
            // Add active class to clicked link
            this.classList.add('active');
            
            // Show target section
            const targetElement = document.getElementById(targetSection);
            if (targetElement) {
                targetElement.classList.add('active');
                
                // Render content for specific sections
                if (window.adminPanel) {
                    switch(targetSection) {
                        case 'blogs':
                            adminPanel.renderBlogs();
                            break;
                        case 'services':
                            adminPanel.renderServices();
                            break;
                        case 'quotes':
                            adminPanel.renderQuotes();
                            break;
                        case 'customers':
                            adminPanel.renderCustomers();
                            break;
                        case 'tickets':
                            adminPanel.renderTickets();
                            break;
                        case 'pricing':
                            adminPanel.renderPricing();
                            break;
                        case 'newsletter':
                            adminPanel.renderNewsletter();
                            adminPanel.updateNewsletterStats();
                            break;
                        case 'notifications':
                            adminPanel.renderNotifications();
                            adminPanel.updateNotificationStats();
                            break;
                    }
                }
            }
        });
    });
}

// Initialize admin panel and navigation when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the admin panel
    window.adminPanel = new AdminPanel();
    
    // Initialize navigation
    initNavigation();
    
    // Initialize button event listeners
    initButtonListeners();
    
    // Load initial data for dashboard
    adminPanel.renderBlogs();
    adminPanel.renderServices();
    adminPanel.renderQuotes();
    adminPanel.renderCustomers();
    adminPanel.renderTickets();
    adminPanel.renderPricing();
});

// Initialize button event listeners
function initButtonListeners() {
    // Logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
    
    // Add blog button
    const addBlogBtn = document.querySelector('[onclick="showAddBlogModal()"]');
    if (addBlogBtn) {
        addBlogBtn.removeAttribute('onclick');
        addBlogBtn.addEventListener('click', showAddBlogModal);
    }
    
    // Add service button
    const addServiceBtn = document.querySelector('[onclick="showAddServiceModal()"]');
    if (addServiceBtn) {
        addServiceBtn.removeAttribute('onclick');
        addServiceBtn.addEventListener('click', showAddServiceModal);
    }
    
    // Add customer button
    const addCustomerBtn = document.querySelector('[onclick="showAddCustomerModal()"]');
    if (addCustomerBtn) {
        addCustomerBtn.removeAttribute('onclick');
        addCustomerBtn.addEventListener('click', showAddCustomerModal);
    }
    
    // Add pricing button
    const addPricingBtn = document.querySelector('[onclick="showAddPricingModal()"]');
    if (addPricingBtn) {
        addPricingBtn.removeAttribute('onclick');
        addPricingBtn.addEventListener('click', showAddPricingModal);
    }
    
    // Send newsletter button
    const sendNewsletterBtn = document.querySelector('[onclick="showSendNewsletterModal()"]');
    if (sendNewsletterBtn) {
        sendNewsletterBtn.removeAttribute('onclick');
        sendNewsletterBtn.addEventListener('click', showSendNewsletterModal);
    }
    
    // Send notification button
    const sendNotificationBtn = document.querySelector('[onclick="showSendNotificationModal()"]');
    if (sendNotificationBtn) {
        sendNotificationBtn.removeAttribute('onclick');
        sendNotificationBtn.addEventListener('click', showSendNotificationModal);
    }
    
    // Generate sitemap button
    const generateSitemapBtn = document.querySelector('[onclick="generateSitemap()"]');
    if (generateSitemapBtn) {
        generateSitemapBtn.removeAttribute('onclick');
        generateSitemapBtn.addEventListener('click', generateSitemap);
    }
    
    // Submit to Google button
    const submitGoogleBtn = document.querySelector('[onclick="submitToGoogle()"]');
    if (submitGoogleBtn) {
        submitGoogleBtn.removeAttribute('onclick');
        submitGoogleBtn.addEventListener('click', submitToGoogle);
    }
    
    // Modal close buttons
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) {
                closeModal(modal.id);
            }
        });
    });
    
    // Form submit handlers
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            // Handle form submissions based on form ID or class
            const formId = this.id;
            if (formId) {
                handleFormSubmit(formId, this);
            }
        });
    });
}

// Handle form submissions
function handleFormSubmit(formId, form) {
    switch(formId) {
        case 'whatsapp-settings-form':
            adminPanel.saveWhatsAppSettings();
            break;
        case 'analytics-settings-form':
            adminPanel.saveAnalyticsSettings();
            break;
        case 'meta-tags-form':
            adminPanel.saveMetaTags();
            break;
        case 'search-console-form':
            adminPanel.saveSearchConsoleSettings();
            break;
        case 'captcha-settings-form':
            adminPanel.saveCaptchaSettings();
            break;
        case 'login-security-form':
            adminPanel.saveLoginSecuritySettings();
            break;
        case 'cloudflare-settings-form':
            adminPanel.saveCloudflareSettings();
            break;
        case 'bin-api-settings-form':
            adminPanel.saveBinApiSettings();
            break;
        case 'smtp-settings-form':
            adminPanel.saveSmtpSettings();
            break;
        case 'change-password-form':
            adminPanel.changePassword();
            break;
        default:
            console.log('Unhandled form submission:', formId);
    }
}

// Firebase Auth-aware fetch wrapper for admin panel
(function() {
    // Store the original fetch function
    const originalFetch = window.fetch;
    
    // Override the global fetch function
    window.fetch = async function(url, options = {}) {
        // Only intercept /api requests
        if (typeof url === 'string' && url.startsWith('/api')) {
            try {
                // Check if Firebase is available and user is signed in
                if (window.FIREBASE_CONFIG && typeof window.firebase !== 'undefined') {
                    // Dynamically load Firebase SDKs if not already loaded
                    if (!window.firebase.apps.length) {
                        // Load Firebase Auth SDK
                        if (!document.querySelector('script[src*="firebase-auth"]')) {
                            await new Promise((resolve, reject) => {
                                const script = document.createElement('script');
                                script.src = 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';
                                script.type = 'module';
                                script.onload = resolve;
                                script.onerror = reject;
                                document.head.appendChild(script);
                            });
                        }
                        
                        // Initialize Firebase
                        const { initializeApp } = await import('https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js');
                        const { getAuth, onAuthStateChanged } = await import('https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js');
                        
                        const app = initializeApp(window.FIREBASE_CONFIG);
                        const auth = getAuth(app);
                        
                        // Wait for auth state and get ID token if user is signed in
                        const user = await new Promise((resolve) => {
                            const unsubscribe = onAuthStateChanged(auth, (user) => {
                                unsubscribe();
                                resolve(user);
                            });
                        });
                        
                        if (user) {
                            const idToken = await user.getIdToken();
                            
                            // Add Firebase ID token to Authorization header
                            options.headers = {
                                ...options.headers,
                                'Authorization': `Bearer ${idToken}`
                            };
                        }
                    }
                }
            } catch (error) {
                console.warn('Firebase Auth not available, falling back to cookie auth:', error);
                // Continue with original request if Firebase fails
            }
        }
        
        // Call the original fetch function
        return originalFetch.call(this, url, options);
    };
})()