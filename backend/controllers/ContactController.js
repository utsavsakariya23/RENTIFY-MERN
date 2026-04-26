const { ContactMessage } = require('../models');

// @desc    Submit a contact message
// @route   POST /api/contact
const submitContactMessage = async (req, res) => {
  const { name, email, phone, subject, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ message: 'Name, email and message are required' });
  }
  try {
    const newMessage = await ContactMessage.create({ name, email, phone, subject, message });
    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all contact messages (Admin)
// @route   GET /api/contact
const getAllContactMessages = async (req, res) => {
  try {
    const messages = await ContactMessage.findAll({ order: [['created_at', 'DESC']] });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark message as read (Admin)
// @route   PUT /api/contact/:id/read
const markMessageRead = async (req, res) => {
  try {
    const msg = await ContactMessage.findByPk(req.params.id);
    if (!msg) return res.status(404).json({ message: 'Message not found' });
    msg.is_read = true;
    await msg.save();
    res.json({ message: 'Marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Admin reply to message
// @route   POST /api/contact/:id/reply
const replyToMessage = async (req, res) => {
  try {
    const { message: replyText } = req.body;
    if (!replyText || !replyText.trim()) {
      return res.status(400).json({ message: 'Reply text is required' });
    }
    const msg = await ContactMessage.findByPk(req.params.id);
    if (!msg) return res.status(404).json({ message: 'Message not found' });
    
    const sendEmail = require('../utils/sendEmail');
    await sendEmail({
      email: msg.email,
      subject: `RE: ${msg.subject || 'Your message to Rentify'}`,
      html: `
        <div style="font-family:sans-serif;padding:20px;">
          <h2>Rentify Admin Support</h2>
          <p>Hello ${msg.name},</p>
          <p>Thank you for reaching out to us. An admin has replied to your message:</p>
          <blockquote style="border-left:4px solid #0d6efd;padding-left:15px;color:#555;font-style:italic;">
            ${replyText.replace(/\n/g, '<br/>')}
          </blockquote>
          <br/>
          <p style="color:#777;font-size:0.9em;">--- Your original message ---<br/>${msg.message}</p>
        </div>
      `
    });

    res.json({ message: 'Reply sent successfully' });
  } catch (error) {
    console.error('Reply error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { submitContactMessage, getAllContactMessages, markMessageRead, replyToMessage };
