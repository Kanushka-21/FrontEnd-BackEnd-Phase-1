import React, { useState } from 'react';
import { 
  BookOpen, ChevronRight, ChevronDown, Search, 
  Calendar, MessageCircle, User, Eye, DollarSign, Clock,
  CheckCircle, AlertCircle, ArrowRight, Home,
  MapPin, Phone, Mail, Trophy, Star, Camera, Shield
} from 'lucide-react';

interface BuyerUserManualProps {
  onNavigate?: (section: string) => void;
}

const BuyerUserManual: React.FC<BuyerUserManualProps> = ({ onNavigate }) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['getting-started']));

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const handleNavigateToSection = (section: string) => {
    if (onNavigate) {
      onNavigate(section);
    }
  };

  const manualSections = [
    {
      id: 'getting-started',
      title: '🚀 Getting Started as a Buyer',
      icon: <Home className="w-5 h-5" />,
      content: [
        {
          title: 'Welcome to GemNet!',
          description: 'As a verified buyer, you can browse, bid on, and purchase authenticated gemstones from verified sellers.',
          steps: [
            'Your account has been verified by our admin team',
            'Browse the marketplace to discover gemstones',
            'Place bids on items you\'re interested in',
            'Schedule meetings with sellers for physical inspection',
            'Complete purchases securely through our platform'
          ]
        },
        {
          title: 'Your Dashboard Overview',
          description: 'Navigate your buyer dashboard efficiently:',
          actionButton: { text: 'Go to Dashboard Overview', action: () => handleNavigateToSection('overview') },
          steps: [
            '📊 Overview: View your bidding activity and recent purchases',
            '🛍️ Reserved Items: Manage items you\'ve won or reserved',
            '📅 Meetings: Schedule and manage meetings with sellers',
            '💬 Feedback: Provide feedback about your experience',
            '👤 Profile: Update your personal information'
          ]
        }
      ]
    },
    {
      id: 'browsing-marketplace',
      title: '🔍 Browsing & Searching',
      icon: <Search className="w-5 h-5" />,
      content: [
        {
          title: 'Marketplace Navigation',
          description: 'Discover gemstones efficiently using our advanced search and filtering system.',
          steps: [
            'Use the search bar to find specific gemstone types',
            'Filter by price range, weight, color, and certification',
            'Sort by newest, price, or ending soon',
            'View detailed gemstone information and certificates',
            'Check seller ratings and verification status'
          ]
        },
        {
          title: 'Understanding Listings',
          description: 'Each gemstone listing contains detailed information:',
          features: [
            { icon: <Camera className="w-4 h-4" />, text: 'High-quality images from multiple angles' },
            { icon: <Shield className="w-4 h-4" />, text: 'Certification details and authenticity verification' },
            { icon: <DollarSign className="w-4 h-4" />, text: 'Starting price and current bid information' },
            { icon: <Clock className="w-4 h-4" />, text: 'Bidding countdown timer' },
            { icon: <Star className="w-4 h-4" />, text: 'Seller rating and verification status' }
          ]
        }
      ]
    },
    {
      id: 'bidding-process',
      title: '💰 Bidding Process',
      icon: <Trophy className="w-5 h-5" />,
      content: [
        {
          title: 'How to Place Bids',
          description: 'Participate in gemstone auctions by placing competitive bids.',
          steps: [
            'Click on a gemstone listing to view details',
            'Review current bid amount and bidding history',
            'Enter your bid amount (must be higher than current bid)',
            'Confirm your bid - this is a binding commitment',
            'Monitor the auction and receive notifications about outbids'
          ],
          warning: {
            icon: <AlertCircle className="w-5 h-5 text-amber-500" />,
            text: 'Important: All bids are legally binding. Only bid amounts you can afford to pay.'
          }
        },
        {
          title: 'Bidding Status & Notifications',
          description: 'Stay updated on your bidding activity:',
          features: [
            { icon: <CheckCircle className="w-4 h-4 text-green-500" />, text: 'Active Bid: You\'re currently the highest bidder' },
            { icon: <AlertCircle className="w-4 h-4 text-red-500" />, text: 'Outbid: Someone has placed a higher bid' },
            { icon: <Trophy className="w-4 h-4 text-yellow-500" />, text: 'Won: You\'ve won the auction!' },
            { icon: <Clock className="w-4 h-4 text-gray-500" />, text: 'Ended: Auction has closed' }
          ]
        },
        {
          title: 'Winning an Auction',
          description: 'When you win an auction:',
          steps: [
            'You\'ll receive immediate notification of your win',
            'The item will appear in your "Reserved Items" section',
            'You have 24 hours to schedule a meeting with the seller',
            'Meet the seller for physical inspection and payment',
            'Complete the transaction through our secure platform'
          ],
          actionButton: { text: 'View Reserved Items', action: () => handleNavigateToSection('reserved') }
        }
      ]
    },
    {
      id: 'meeting-management',
      title: '📅 Meeting Management',
      icon: <Calendar className="w-5 h-5" />,
      content: [
        {
          title: 'Scheduling Meetings',
          description: 'Arrange in-person meetings with sellers for gemstone inspection.',
          steps: [
            'Go to your Reserved Items or Meetings section',
            'Click "Schedule Meeting" for the item you won',
            'Choose from available time slots provided by the seller',
            'Confirm your preferred meeting time and location',
            'Receive confirmation and meeting details'
          ],
          actionButton: { text: 'Manage Meetings', action: () => handleNavigateToSection('meetings') }
        },
        {
          title: 'Meeting Guidelines',
          description: 'Important information for successful meetings:',
          features: [
            { icon: <MapPin className="w-4 h-4" />, text: 'Meeting Location: Usually at seller\'s verified address' },
            { icon: <Clock className="w-4 h-4" />, text: 'Punctuality: Arrive on time to respect seller\'s schedule' },
            { icon: <Eye className="w-4 h-4" />, text: 'Inspection: Carefully examine the gemstone before purchase' },
            { icon: <DollarSign className="w-4 h-4" />, text: 'Payment: Bring exact amount or preferred payment method' }
          ]
        },
        {
          title: 'Meeting Status & Attendance',
          description: 'Meeting status tracking:',
          features: [
            { icon: <Clock className="w-4 h-4 text-yellow-500" />, text: 'Scheduled: Meeting confirmed and pending' },
            { icon: <CheckCircle className="w-4 h-4 text-green-500" />, text: 'Completed: Meeting successfully completed' },
            { icon: <AlertCircle className="w-4 h-4 text-red-500" />, text: 'Not Participated: Missed meeting (affects your account)' },
            { icon: <Calendar className="w-4 h-4 text-blue-500" />, text: 'Rescheduled: Meeting moved to new time' }
          ],
          warning: {
            icon: <AlertCircle className="w-5 h-5 text-red-500" />,
            text: 'Participation Policy: Missing meetings without notice may result in account warnings or restrictions.'
          }
        }
      ]
    },
    {
      id: 'account-management',
      title: '👤 Account Management',
      icon: <User className="w-5 h-5" />,
      content: [
        {
          title: 'Profile Management',
          description: 'Keep your account information updated and secure.',
          steps: [
            'Update personal information in your profile section',
            'Manage contact details and preferences',
            'Update notification settings',
            'Review your account verification status',
            'View your bidding and purchase history'
          ],
          actionButton: { text: 'Update Profile', action: () => handleNavigateToSection('profile') }
        },
        {
          title: 'Account Status & Verification',
          description: 'Understanding your account status:',
          features: [
            { icon: <CheckCircle className="w-4 h-4 text-green-500" />, text: 'Verified: Full access to all platform features' },
            { icon: <AlertCircle className="w-4 h-4 text-yellow-500" />, text: 'Warned: Account flagged for missed meetings' },
            { icon: <AlertCircle className="w-4 h-4 text-red-500" />, text: 'Blocked: Temporary restriction due to policy violations' }
          ]
        }
      ]
    },
    {
      id: 'support-feedback',
      title: '💬 Support & Feedback',
      icon: <MessageCircle className="w-5 h-5" />,
      content: [
        {
          title: 'Getting Help',
          description: 'Multiple ways to get assistance when you need it.',
          features: [
            { icon: <Mail className="w-4 h-4" />, text: 'Email Support: gemnetsystem@gmail.com' },
            { icon: <MessageCircle className="w-4 h-4" />, text: 'Feedback Form: Built-in feedback system' },
            { icon: <Phone className="w-4 h-4" />, text: 'Admin Contact: Direct communication with admin team' },
            { icon: <BookOpen className="w-4 h-4" />, text: 'User Manual: Comprehensive guides and tutorials' }
          ],
          actionButton: { text: 'Submit Feedback', action: () => handleNavigateToSection('feedback') }
        },
        {
          title: 'Common Issues & Solutions',
          description: 'Quick solutions to frequently encountered problems:',
          steps: [
            'Bidding Issues: Ensure you meet minimum bid requirements',
            'Meeting Scheduling: Check seller availability and time zones',
            'Payment Problems: Verify your payment method is valid',
            'Account Access: Contact admin if you can\'t access features',
            'Technical Issues: Clear browser cache or try different browser'
          ]
        }
      ]
    },
    {
      id: 'platform-workflow',
      title: '🔄 Complete Workflow',
      icon: <ArrowRight className="w-5 h-5" />,
      content: [
        {
          title: 'Your Journey as a Buyer',
          description: 'The complete process from browsing to purchase:',
          workflow: [
            { step: 1, title: 'Browse Marketplace', description: 'Search and filter gemstones by your preferences', icon: <Search className="w-5 h-5" /> },
            { step: 2, title: 'Place Bids', description: 'Bid on gemstones that interest you', icon: <DollarSign className="w-5 h-5" /> },
            { step: 3, title: 'Win Auction', description: 'Highest bidder when auction ends', icon: <Trophy className="w-5 h-5" /> },
            { step: 4, title: 'Schedule Meeting', description: 'Arrange in-person inspection with seller', icon: <Calendar className="w-5 h-5" /> },
            { step: 5, title: 'Inspect Gemstone', description: 'Physical examination at meeting location', icon: <Eye className="w-5 h-5" /> },
            { step: 6, title: 'Complete Purchase', description: 'Finalize payment and take ownership', icon: <CheckCircle className="w-5 h-5" /> }
          ]
        },
        {
          title: 'Who Handles What',
          description: 'Understanding roles and responsibilities:',
          roles: [
            { role: 'Buyers (You)', responsibilities: ['Browse and bid on gemstones', 'Schedule and attend meetings', 'Complete payments', 'Provide feedback'], color: 'blue' },
            { role: 'Sellers', responsibilities: ['List gemstones for auction', 'Provide accurate descriptions', 'Host meetings for inspection', 'Transfer ownership after payment'], color: 'purple' },
            { role: 'Admins', responsibilities: ['Verify user accounts', 'Approve gemstone listings', 'Monitor meeting attendance', 'Handle disputes and support'], color: 'green' }
          ]
        }
      ]
    }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
          <BookOpen className="w-8 h-8 text-blue-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Buyer User Manual</h1>
        <p className="text-lg text-gray-600">Complete guide to using GemNet as a verified buyer</p>
      </div>

      {/* Table of Contents */}
      <div className="mb-8 p-6 bg-gray-50 rounded-lg">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Table of Contents</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {manualSections.map((section) => (
            <button
              key={section.id}
              onClick={() => toggleSection(section.id)}
              className="flex items-center space-x-3 text-left p-3 rounded-lg hover:bg-white transition-colors"
            >
              <span className="flex-shrink-0">{section.icon}</span>
              <span className="text-sm font-medium text-gray-700">{section.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Manual Sections */}
      <div className="space-y-6">
        {manualSections.map((section) => (
          <div
            key={section.id}
            className="border border-gray-200 rounded-lg overflow-hidden"
          >
            <button
              onClick={() => toggleSection(section.id)}
              className="w-full flex items-center justify-between p-6 bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center space-x-3">
                {section.icon}
                <h2 className="text-xl font-semibold text-gray-900">{section.title}</h2>
              </div>
              {expandedSections.has(section.id) ? (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronRight className="w-5 h-5 text-gray-500" />
              )}
            </button>

            {expandedSections.has(section.id) && (
              <div className="border-t border-gray-200">
                <div className="p-6 space-y-8">
                    {section.content.map((content, contentIndex) => (
                      <div key={contentIndex} className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900">{content.title}</h3>
                        <p className="text-gray-600 leading-relaxed">{content.description}</p>

                        {/* Steps */}
                        {'steps' in content && content.steps && (
                          <div className="space-y-3">
                            {content.steps.map((step: string, stepIndex: number) => (
                              <div key={stepIndex} className="flex items-start space-x-3">
                                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                                  <span className="text-xs font-medium text-blue-600">{stepIndex + 1}</span>
                                </div>
                                <p className="text-gray-700">{step}</p>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Features */}
                        {'features' in content && content.features && (
                          <div className="space-y-3">
                            {content.features.map((feature: any, featureIndex: number) => (
                              <div key={featureIndex} className="flex items-center space-x-3">
                                <span className="text-blue-600">{feature.icon}</span>
                                <p className="text-gray-700">{feature.text}</p>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Workflow */}
                        {'workflow' in content && content.workflow && (
                          <div className="space-y-4">
                            {content.workflow.map((step: any, stepIndex: number) => (
                              <div key={stepIndex} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                                <div className="flex-shrink-0 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                                  {step.step}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <span className="text-blue-600">{step.icon}</span>
                                    <h4 className="font-semibold text-gray-900">{step.title}</h4>
                                  </div>
                                  <p className="text-gray-600">{step.description}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Roles */}
                        {'roles' in content && content.roles && (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {content.roles.map((role: any, roleIndex: number) => (
                              <div key={roleIndex} className={`p-4 rounded-lg border-l-4 border-${role.color}-500 bg-${role.color}-50`}>
                                <h4 className={`font-semibold text-${role.color}-900 mb-2`}>{role.role}</h4>
                                <ul className="space-y-1">
                                  {role.responsibilities.map((responsibility: string, respIndex: number) => (
                                    <li key={respIndex} className={`text-sm text-${role.color}-700`}>
                                      • {responsibility}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Warning */}
                        {'warning' in content && content.warning && (
                          <div className="flex items-start space-x-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                            {content.warning.icon}
                            <p className="text-amber-800">{content.warning.text}</p>
                          </div>
                        )}

                        {/* Action Button */}
                        {'actionButton' in content && content.actionButton && (
                          <button
                            onClick={content.actionButton.action}
                            className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            <span>{content.actionButton.text}</span>
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-12 p-6 bg-blue-50 rounded-lg text-center">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Need Additional Help?</h3>
        <p className="text-blue-700 mb-4">
          If you have questions not covered in this manual, our support team is here to help.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4">
          <a
            href="mailto:gemnetsystem@gmail.com"
            className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Mail className="w-4 h-4" />
            <span>Contact Support</span>
          </a>
          <button
            onClick={() => handleNavigateToSection('feedback')}
            className="inline-flex items-center space-x-2 px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Submit Feedback</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default BuyerUserManual;