import React, { useState } from 'react';
import { 
  BookOpen, ChevronRight, ChevronDown, Package, 
  Calendar, MessageCircle, User, Eye, DollarSign, Clock,
  CheckCircle, AlertCircle, ArrowRight, Home,
  MapPin, Phone, Mail, Trophy, Star, Camera, Shield,
  Upload, Gavel, Video, Image as ImageIcon, FileText,
  Users, TrendingUp, BarChart3, Target
} from 'lucide-react';

interface SellerUserManualProps {
  onNavigate?: (section: string) => void;
}

const SellerUserManual: React.FC<SellerUserManualProps> = ({ onNavigate }) => {
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
      title: '🚀 Getting Started as a Seller',
      icon: <Home className="w-5 h-5" />,
      content: [
        {
          title: 'Welcome to GemNet Seller Platform!',
          description: 'As a verified seller, you can list gemstones, create advertisements, manage auctions, and meet with potential buyers.',
          steps: [
            'Your seller account has been verified by our admin team',
            'List your authenticated gemstones for auction',
            'Create attractive advertisements to showcase your items',
            'Manage bids and communicate with interested buyers',
            'Schedule meetings for gemstone inspections',
            'Complete sales through secure transactions'
          ]
        },
        {
          title: 'Your Seller Dashboard Overview',
          description: 'Navigate your comprehensive seller dashboard:',
          actionButton: { text: 'Go to Dashboard Overview', action: () => handleNavigateToSection('overview') },
          steps: [
            '📊 Overview: Monitor your sales performance and analytics',
            '📦 List Items: Create and manage gemstone listings',
            '📺 Advertisements: Create video/image ads for promotion',
            '🏆 Bids: Track and manage auction bids on your items',
            '📅 Meetings: Schedule and manage buyer meetings',
            '💬 Feedback: View and respond to buyer feedback',
            '👤 Profile: Update your seller information and credentials'
          ]
        }
      ]
    },
    {
      id: 'listing-management',
      title: '📦 Creating & Managing Listings',
      icon: <Package className="w-5 h-5" />,
      content: [
        {
          title: 'How to Create a Gemstone Listing',
          description: 'List your gemstones for auction with detailed information and authentication.',
          steps: [
            'Navigate to "List Items" section in your dashboard',
            'Click "Add New Listing" to start the listing process',
            'Upload high-quality images from multiple angles',
            'Provide detailed gemstone information (type, weight, color, clarity)',
            'Add certification details and authentication documents',
            'Set starting bid price and auction duration',
            'Submit for admin approval before going live'
          ],
          actionButton: { text: 'Create New Listing', action: () => handleNavigateToSection('list-items') }
        },
        {
          title: 'Listing Requirements & Best Practices',
          description: 'Ensure your listings meet platform standards and attract buyers:',
          features: [
            { icon: <Camera className="w-4 h-4" />, text: 'High-Resolution Images: Multiple angles, natural lighting, close-ups' },
            { icon: <Shield className="w-4 h-4" />, text: 'Authentication: Valid certificates from recognized laboratories' },
            { icon: <FileText className="w-4 h-4" />, text: 'Detailed Description: Accurate weight, dimensions, treatments' },
            { icon: <DollarSign className="w-4 h-4" />, text: 'Competitive Pricing: Research market rates for similar gemstones' },
            { icon: <Clock className="w-4 h-4" />, text: 'Auction Duration: Optimal timing for maximum bidder participation' }
          ]
        },
        {
          title: 'Admin Approval Process',
          description: 'Understanding the listing approval workflow:',
          workflow: [
            { step: 1, title: 'Submit Listing', description: 'Complete listing form with all required information', icon: <Upload className="w-5 h-5" /> },
            { step: 2, title: 'Admin Review', description: 'Platform admin verifies gemstone details and authenticity', icon: <Eye className="w-5 h-5" /> },
            { step: 3, title: 'Approval/Feedback', description: 'Listing approved or returned with improvement suggestions', icon: <CheckCircle className="w-5 h-5" /> },
            { step: 4, title: 'Go Live', description: 'Approved listing becomes active for bidding', icon: <Gavel className="w-5 h-5" /> }
          ]
        },
        {
          title: 'Managing Active Listings',
          description: 'Monitor and manage your live auctions:',
          features: [
            { icon: <TrendingUp className="w-4 h-4" />, text: 'Real-time bid tracking and notifications' },
            { icon: <Users className="w-4 h-4" />, text: 'Bidder activity and engagement analytics' },
            { icon: <Calendar className="w-4 h-4" />, text: 'Auction countdown and time management' },
            { icon: <BarChart3 className="w-4 h-4" />, text: 'Performance metrics and listing optimization tips' }
          ]
        }
      ]
    },
    {
      id: 'advertisement-system',
      title: '📺 Advertisement Management',
      icon: <Target className="w-5 h-5" />,
      content: [
        {
          title: 'Creating Promotional Advertisements',
          description: 'Boost visibility with video and image advertisements on the homepage.',
          steps: [
            'Go to "Advertisements" section in your dashboard',
            'Click "Create New Advertisement" to begin',
            'Upload promotional video (MP4, WebM, AVI, MOV, WMV - max 50MB)',
            'Add high-quality promotional images as backup/slideshow',
            'Write compelling advertisement title and description',
            'Submit for admin approval before publication'
          ],
          actionButton: { text: 'Create Advertisement', action: () => handleNavigateToSection('advertisements') }
        },
        {
          title: 'Advertisement Media Guidelines',
          description: 'Create engaging advertisements that comply with platform standards:',
          features: [
            { icon: <Video className="w-4 h-4" />, text: 'Video Format: MP4, WebM, AVI, MOV, WMV (max 50MB)' },
            { icon: <ImageIcon className="w-4 h-4" />, text: 'Image Quality: High-resolution, professional appearance' },
            { icon: <Clock className="w-4 h-4" />, text: 'Video Length: 15-60 seconds recommended for engagement' },
            { icon: <Shield className="w-4 h-4" />, text: 'Content Policy: Professional, accurate, family-friendly content' }
          ]
        },
        {
          title: 'Advertisement Display & Performance',
          description: 'How your advertisements appear to potential buyers:',
          features: [
            { icon: <Target className="w-4 h-4" />, text: 'Homepage Placement: Featured in homepage advertisement modal' },
            { icon: <Video className="w-4 h-4" />, text: 'Auto-play Videos: Videos play automatically to grab attention' },
            { icon: <ImageIcon className="w-4 h-4" />, text: 'Image Slideshow: Multiple images display in sequence' },
            { icon: <BarChart3 className="w-4 h-4" />, text: 'Analytics: Track views and engagement metrics' }
          ]
        },
        {
          title: 'Managing Your Advertisements',
          description: 'View and manage your promotional content:',
          steps: [
            'Access "Advertisements" section to see all your ads',
            'View advertisement status (Pending, Approved, Active)',
            'Click "View" to see how your ad appears to buyers',
            'Edit or update advertisement content as needed',
            'Monitor performance analytics and engagement'
          ]
        }
      ]
    },
    {
      id: 'bid-management',
      title: '🏆 Bid & Auction Management',
      icon: <Gavel className="w-5 h-5" />,
      content: [
        {
          title: 'Monitoring Auction Activity',
          description: 'Track bids and manage your auctions effectively.',
          actionButton: { text: 'View Bid Activity', action: () => handleNavigateToSection('bids') },
          steps: [
            'Navigate to "Bids" section to see all auction activity',
            'Monitor real-time bidding on your listed items',
            'Receive notifications for new bids and auction milestones',
            'Track bidder information and engagement patterns',
            'Prepare for auction endings and winner communications'
          ]
        },
        {
          title: 'Understanding Bid Information',
          description: 'Key metrics and data available for your auctions:',
          features: [
            { icon: <DollarSign className="w-4 h-4" />, text: 'Current Bid: Highest bid amount and bidder information' },
            { icon: <Users className="w-4 h-4" />, text: 'Bidder Count: Number of unique participants' },
            { icon: <Clock className="w-4 h-4" />, text: 'Time Remaining: Countdown to auction end' },
            { icon: <TrendingUp className="w-4 h-4" />, text: 'Bid History: Complete chronological bidding activity' },
            { icon: <Trophy className="w-4 h-4" />, text: 'Reserve Status: Whether reserve price has been met' }
          ]
        },
        {
          title: 'Auction Completion Process',
          description: 'What happens when your auction ends:',
          workflow: [
            { step: 1, title: 'Auction Ends', description: 'Bidding closes at specified end time', icon: <Clock className="w-5 h-5" /> },
            { step: 2, title: 'Winner Notification', description: 'Highest bidder is notified of their win', icon: <Trophy className="w-5 h-5" /> },
            { step: 3, title: 'Meeting Request', description: 'Winner has 24 hours to schedule meeting', icon: <Calendar className="w-5 h-5" /> },
            { step: 4, title: 'Prepare for Meeting', description: 'Prepare gemstone and documentation', icon: <Package className="w-5 h-5" /> }
          ]
        }
      ]
    },
    {
      id: 'meeting-management',
      title: '📅 Meeting Management',
      icon: <Calendar className="w-5 h-5" />,
      content: [
        {
          title: 'Handling Meeting Requests',
          description: 'Manage in-person meetings with auction winners for gemstone inspection.',
          steps: [
            'Receive meeting requests from auction winners',
            'Respond to requests within 24 hours',
            'Provide available time slots for meetings',
            'Confirm meeting location (usually your verified address)',
            'Prepare gemstone and documentation for inspection'
          ],
          actionButton: { text: 'Manage Meetings', action: () => handleNavigateToSection('meetings') }
        },
        {
          title: 'Meeting Preparation Checklist',
          description: 'Essential items and preparations for successful meetings:',
          features: [
            { icon: <Package className="w-4 h-4" />, text: 'Gemstone: Clean and properly presented for inspection' },
            { icon: <FileText className="w-4 h-4" />, text: 'Documentation: Certificates, appraisals, purchase receipts' },
            { icon: <MapPin className="w-4 h-4" />, text: 'Location: Clean, well-lit space for proper examination' },
            { icon: <Shield className="w-4 h-4" />, text: 'Security: Ensure safe environment for valuable gemstone' },
            { icon: <DollarSign className="w-4 h-4" />, text: 'Payment Method: Know buyer\'s preferred payment method' }
          ]
        },
        {
          title: 'Meeting Guidelines & Best Practices',
          description: 'Professional standards for successful transactions:',
          features: [
            { icon: <Clock className="w-4 h-4" />, text: 'Punctuality: Be available at scheduled meeting time' },
            { icon: <Eye className="w-4 h-4" />, text: 'Inspection: Allow thorough examination of the gemstone' },
            { icon: <MessageCircle className="w-4 h-4" />, text: 'Communication: Answer questions honestly and professionally' },
            { icon: <CheckCircle className="w-4 h-4" />, text: 'Documentation: Complete transaction paperwork properly' }
          ]
        },
        {
          title: 'Meeting Status Tracking',
          description: 'Monitor meeting progress and outcomes:',
          features: [
            { icon: <Calendar className="w-4 h-4 text-yellow-500" />, text: 'Requested: Buyer has requested a meeting' },
            { icon: <CheckCircle className="w-4 h-4 text-blue-500" />, text: 'Scheduled: Meeting time and location confirmed' },
            { icon: <Trophy className="w-4 h-4 text-green-500" />, text: 'Completed: Meeting held and sale finalized' },
            { icon: <AlertCircle className="w-4 h-4 text-red-500" />, text: 'Not Participated: Buyer failed to attend scheduled meeting' }
          ]
        }
      ]
    },
    {
      id: 'performance-analytics',
      title: '📊 Performance & Analytics',
      icon: <BarChart3 className="w-5 h-5" />,
      content: [
        {
          title: 'Sales Performance Dashboard',
          description: 'Track your selling success and optimize your strategy.',
          actionButton: { text: 'View Analytics', action: () => handleNavigateToSection('overview') },
          features: [
            { icon: <DollarSign className="w-4 h-4" />, text: 'Total Sales: Revenue from completed transactions' },
            { icon: <Package className="w-4 h-4" />, text: 'Active Listings: Currently live auction items' },
            { icon: <Gavel className="w-4 h-4" />, text: 'Successful Auctions: Completed sales ratio' },
            { icon: <Users className="w-4 h-4" />, text: 'Buyer Engagement: Bidder participation metrics' },
            { icon: <Star className="w-4 h-4" />, text: 'Seller Rating: Average feedback score from buyers' }
          ]
        },
        {
          title: 'Optimization Insights',
          description: 'Data-driven recommendations to improve your selling performance:',
          steps: [
            'Review which gemstone types generate most interest',
            'Analyze optimal auction durations for your items',
            'Monitor price points that attract competitive bidding',
            'Track seasonal trends in gemstone demand',
            'Identify most effective advertisement strategies'
          ]
        }
      ]
    },
    {
      id: 'account-management',
      title: '👤 Account & Profile Management',
      icon: <User className="w-5 h-5" />,
      content: [
        {
          title: 'Seller Profile Management',
          description: 'Maintain a professional seller profile that builds buyer confidence.',
          steps: [
            'Update your seller verification information',
            'Add professional bio and business background',
            'Upload seller credentials and certifications',
            'Manage contact information and business hours',
            'Set meeting location and availability preferences'
          ],
          actionButton: { text: 'Update Profile', action: () => handleNavigateToSection('profile') }
        },
        {
          title: 'Seller Verification & Credentials',
          description: 'Maintain verified status and professional credentials:',
          features: [
            { icon: <Shield className="w-4 h-4" />, text: 'Verified Status: Admin-approved seller account' },
            { icon: <FileText className="w-4 h-4" />, text: 'Business License: Valid business registration documents' },
            { icon: <Star className="w-4 h-4" />, text: 'Gemology Certification: Professional gemology credentials' },
            { icon: <MapPin className="w-4 h-4" />, text: 'Verified Address: Confirmed business location' },
            { icon: <Trophy className="w-4 h-4" />, text: 'Seller Rating: Buyer feedback and transaction history' }
          ]
        },
        {
          title: 'Account Status & Compliance',
          description: 'Understanding seller account status levels:',
          features: [
            { icon: <CheckCircle className="w-4 h-4 text-green-500" />, text: 'Active: Full access to all seller features' },
            { icon: <AlertCircle className="w-4 h-4 text-yellow-500" />, text: 'Warning: Account flagged for policy review' },
            { icon: <AlertCircle className="w-4 h-4 text-red-500" />, text: 'Suspended: Temporary restriction on selling activities' }
          ]
        }
      ]
    },
    {
      id: 'support-feedback',
      title: '💬 Support & Customer Relations',
      icon: <MessageCircle className="w-5 h-5" />,
      content: [
        {
          title: 'Managing Buyer Feedback',
          description: 'Build reputation through excellent customer service and feedback management.',
          actionButton: { text: 'View Feedback', action: () => handleNavigateToSection('feedback') },
          steps: [
            'Monitor feedback from completed transactions',
            'Respond professionally to buyer comments',
            'Address any concerns or issues promptly',
            'Use feedback to improve your selling process',
            'Build positive seller reputation over time'
          ]
        },
        {
          title: 'Getting Support',
          description: 'Resources available when you need assistance:',
          features: [
            { icon: <Mail className="w-4 h-4" />, text: 'Email Support: gemnetsystem@gmail.com' },
            { icon: <MessageCircle className="w-4 h-4" />, text: 'Platform Messaging: Direct communication with admin team' },
            { icon: <Phone className="w-4 h-4" />, text: 'Priority Support: Faster response for verified sellers' },
            { icon: <BookOpen className="w-4 h-4" />, text: 'Seller Resources: Guides, best practices, and tutorials' }
          ]
        },
        {
          title: 'Common Seller Issues & Solutions',
          description: 'Quick solutions to frequently encountered problems:',
          steps: [
            'Listing Rejections: Ensure all documentation is complete and accurate',
            'Low Bidding Activity: Review pricing strategy and listing quality',
            'Meeting Missed Meetings: Follow up with buyers and report to admin if needed',
            'Payment Issues: Verify buyer payment methods before finalizing sales',
            'Technical Problems: Clear browser cache or contact support'
          ]
        }
      ]
    },
    {
      id: 'platform-workflow',
      title: '🔄 Complete Seller Workflow',
      icon: <ArrowRight className="w-5 h-5" />,
      content: [
        {
          title: 'Your Journey as a Seller',
          description: 'The complete process from listing to sale completion:',
          workflow: [
            { step: 1, title: 'Create Listing', description: 'Prepare gemstone documentation and create detailed listing', icon: <Package className="w-5 h-5" /> },
            { step: 2, title: 'Admin Approval', description: 'Wait for platform admin to verify and approve listing', icon: <Shield className="w-5 h-5" /> },
            { step: 3, title: 'Live Auction', description: 'Monitor bidding activity and buyer engagement', icon: <Gavel className="w-5 h-5" /> },
            { step: 4, title: 'Auction Ends', description: 'Auction closes with highest bidder as winner', icon: <Trophy className="w-5 h-5" /> },
            { step: 5, title: 'Schedule Meeting', description: 'Arrange in-person meeting with winning buyer', icon: <Calendar className="w-5 h-5" /> },
            { step: 6, title: 'Complete Sale', description: 'Conduct meeting, allow inspection, finalize payment', icon: <CheckCircle className="w-5 h-5" /> }
          ]
        },
        {
          title: 'Platform Ecosystem Roles',
          description: 'Understanding how all parties work together:',
          roles: [
            { 
              role: 'Sellers (You)', 
              responsibilities: [
                'List authenticated gemstones for auction',
                'Create promotional advertisements',
                'Manage meetings with buyers',
                'Provide excellent customer service'
              ], 
              color: 'purple' 
            },
            { 
              role: 'Buyers', 
              responsibilities: [
                'Browse and bid on gemstone listings',
                'Schedule meetings for inspection',
                'Complete payments for won auctions',
                'Provide feedback on transactions'
              ], 
              color: 'blue' 
            },
            { 
              role: 'Admins', 
              responsibilities: [
                'Verify seller accounts and credentials',
                'Approve gemstone listings and advertisements',
                'Monitor platform compliance and safety',
                'Handle disputes and provide support'
              ], 
              color: 'green' 
            }
          ]
        },
        {
          title: 'Success Tips for Sellers',
          description: 'Best practices to maximize your selling success:',
          features: [
            { icon: <Camera className="w-4 h-4" />, text: 'Quality Photography: Professional images increase bidding activity' },
            { icon: <FileText className="w-4 h-4" />, text: 'Detailed Descriptions: Accurate information builds buyer confidence' },
            { icon: <Star className="w-4 h-4" />, text: 'Excellent Service: Positive feedback improves seller reputation' },
            { icon: <Clock className="w-4 h-4" />, text: 'Timely Communication: Quick responses to buyers enhance trust' },
            { icon: <Shield className="w-4 h-4" />, text: 'Authentication: Proper documentation ensures smooth approvals' }
          ]
        }
      ]
    }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
          <BookOpen className="w-8 h-8 text-purple-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Seller User Manual</h1>
        <p className="text-lg text-gray-600">Complete guide to selling gemstones on GemNet platform</p>
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
                                <div className="flex-shrink-0 w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mt-0.5">
                                  <span className="text-xs font-medium text-purple-600">{stepIndex + 1}</span>
                                </div>
                                <p className="text-gray-700">{step}</p>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Features */}
                        {content.features && (
                          <div className="space-y-3">
                            {content.features.map((feature, featureIndex) => (
                              <div key={featureIndex} className="flex items-center space-x-3">
                                <span className="text-purple-600">{feature.icon as React.ReactNode}</span>
                                <p className="text-gray-700">{feature.text}</p>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Workflow */}
                        {'workflow' in content && content.workflow && (
                          <div className="space-y-4">
                            {(content.workflow as any[]).map((step: any, stepIndex: number) => (
                              <div key={stepIndex} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                                <div className="flex-shrink-0 w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                                  {step.step}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <span className="text-purple-600">{step.icon as React.ReactNode}</span>
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
                            {(content.warning as any).icon}
                            <p className="text-amber-800">{(content.warning as any).text}</p>
                          </div>
                        )}

                        {/* Action Button */}
                        {'actionButton' in content && content.actionButton && (
                          <button
                            onClick={content.actionButton.action}
                            className="inline-flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
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
      <div className="mt-12 p-6 bg-purple-50 rounded-lg text-center">
        <h3 className="text-lg font-semibold text-purple-900 mb-2">Need Seller Support?</h3>
        <p className="text-purple-700 mb-4">
          As a verified seller, you have access to priority support for any questions or issues.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4">
          <a
            href="mailto:gemnetsystem@gmail.com"
            className="inline-flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Mail className="w-4 h-4" />
            <span>Priority Support</span>
          </a>
          <button
            onClick={() => handleNavigateToSection('feedback')}
            className="inline-flex items-center space-x-2 px-4 py-2 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Submit Feedback</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SellerUserManual;