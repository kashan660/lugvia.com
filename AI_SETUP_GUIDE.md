# 🤖 Lugvia AI Integration Setup Guide

## Overview
Lugvia now supports real OpenAI integration for enhanced conversational AI capabilities. This guide will help you set up and use the AI features securely.

## 🔧 Setup Options

### Option 1: Browser Setup (Recommended for Testing)
1. Open the AI Chat page
2. Look for the AI status message
3. Click "Setup AI" button
4. Enter your OpenAI API key
5. Test the connection

### Option 2: Environment Configuration (Recommended for Production)
1. Copy `.env.example` to `.env`
2. Edit `.env` and add your OpenAI API key:
   ```
   OPENAI_API_KEY=your_actual_api_key_here
   ```
3. Restart the server

## 🔑 Getting an OpenAI API Key

1. **Visit OpenAI Platform**: Go to [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. **Sign In/Sign Up**: Create an account or sign in
3. **Create API Key**: Click "Create new secret key"
4. **Copy the Key**: Save it securely (you won't see it again)
5. **Add Billing**: Ensure you have billing set up for API usage

## 🛡️ Security Best Practices

### ✅ DO:
- Store API keys in environment variables
- Use `.env` files for local development
- Add `.env` to your `.gitignore`
- Rotate API keys regularly
- Monitor API usage and costs
- Set usage limits in OpenAI dashboard

### ❌ DON'T:
- Share API keys in chat, email, or public spaces
- Commit API keys to version control
- Use API keys in client-side code in production
- Leave unused API keys active

## 🚀 Features

### Real AI Responses
- Natural conversation with OpenAI's GPT models
- Context-aware responses based on conversation history
- Personalized advice based on user profile and quotes

### Fallback System
- Automatic fallback to intent-based responses if AI fails
- No interruption in user experience
- Graceful error handling

### Smart Context
- Conversation history integration
- User profile awareness
- Quote and recommendation context

## 🔧 Configuration Options

### Environment Variables
```bash
# OpenAI Configuration
OPENAI_API_KEY=sk-your-key-here
OPENAI_MODEL=gpt-3.5-turbo          # or gpt-4
OPENAI_MAX_TOKENS=1000               # Response length limit

# Security
API_RATE_LIMIT=100                   # Requests per minute
API_TIMEOUT=30000                    # Request timeout (ms)

# Server
PORT=8000
NODE_ENV=development
```

### Model Options
- `gpt-3.5-turbo`: Fast, cost-effective
- `gpt-4`: More capable, higher cost
- `gpt-4-turbo`: Latest model with improved performance

## 💰 Cost Management

### Monitoring Usage
- Check OpenAI dashboard regularly
- Set up billing alerts
- Monitor token usage in browser console

### Cost Optimization
- Use `gpt-3.5-turbo` for most interactions
- Limit `max_tokens` to control response length
- Implement rate limiting
- Cache common responses when possible

## 🐛 Troubleshooting

### Common Issues

**"API key not configured"**
- Ensure API key is set correctly
- Check for typos in the key
- Verify key is active in OpenAI dashboard

**"Rate limit exceeded"**
- Wait before making more requests
- Check your OpenAI usage limits
- Consider upgrading your OpenAI plan

**"Connection failed"**
- Check internet connection
- Verify OpenAI service status
- Check firewall/proxy settings

**"Invalid API key format"**
- Ensure key starts with 'sk-'
- Check for extra spaces or characters
- Generate a new key if needed

### Debug Mode
Open browser console to see detailed logs:
- ✅ OpenAI integration enabled
- ⚠️ OpenAI connection test failed
- ℹ️ OpenAI not configured

## 📞 Support

If you encounter issues:
1. Check this guide first
2. Review browser console for errors
3. Verify OpenAI dashboard for account issues
4. Contact support with specific error messages

## 🔄 Updates

The AI integration will automatically:
- Fall back to simulated responses if needed
- Handle API errors gracefully
- Maintain conversation flow
- Preserve user experience

---

**Remember**: Your API key is valuable - treat it like a password! 🔐