import React, { useState } from 'react';
import { 
  ChevronRight, ChevronDown, Shield, Users, 
  Calendar, MessageCircle, Eye, DollarSign, Clock,
  CheckCircle, AlertCircle, ArrowRight, Home, Settings,
  Mail, Trophy, Star, Camera, Package,
  FileText, Gavel, Target, BarChart3, UserCheck,
  UserX, Ban, Flag, Database,
  TrendingUp, Activity, Bell, Lock
} from 'lucide-react';

interface AdminUserManualProps {
  onNavigate?: (section: string) => void;
}

const AdminUserManual: React.FC<AdminUserManualProps> = ({ onNavigate }) => {
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
      title: '🛡️ Admin Dashboard Overview',
      icon: <Home className="w-5 h-5" />,
      content: [
        {
          title: 'Welcome to GemNet Admin Platform!',
          description: 'As a platform administrator, you have complete control over user management, content approval, and system oversight.',
          steps: [
            'Monitor and manage all platform users (Buyers, Sellers)',
            'Review and approve gemstone listings and advertisements',
            'Oversee meeting scheduling and attendance tracking',
            'Handle user verification and account status management',
            'Manage platform settings and security policies',
            'Provide support and resolve disputes between users'
          ]
        },
        {
          title: 'Your Admin Dashboard Navigation',
          description: 'Comprehensive control panel for platform management:',
          steps: [
            '👥 User Management: Verify, approve, and manage all user accounts',
            '📦 Listing Management: Review and approve gemstone listings',
            '📺 Advertisement Management: Approve promotional content',
            '📅 Meeting Requests: Oversee buyer-seller meeting coordination',
            '📊 Attendance Tracking: Monitor meeting completion rates',
            '🚫 No-Show Management: Handle missed meeting incidents',
            '🔒 Blocked Users: Manage suspended and restricted accounts',
            '💬 Feedback Management: Review and respond to user feedback',
            '⚙️ System Settings: Configure platform parameters and policies'
          ]
        }
      ]
    },
    {
      id: 'user-management',
      title: '👥 User Management System',
      icon: <Users className="w-5 h-5" />,
      content: [
        {
          title: 'User Verification Process',
          description: 'Approve and verify new user accounts joining the platform.',
          actionButton: { text: 'Manage Users', action: () => handleNavigateToSection('user-management') },
          steps: [
            'Review new user registration applications',
            'Verify submitted identification documents',
            'Check business credentials for seller accounts',
            'Approve or reject user applications with feedback',
            'Monitor user status changes and updates'
          ]
        },
        {
          title: 'User Status Management',
          description: 'Control user access levels and account statuses:',
          features: [
            { icon: <UserCheck className="w-4 h-4 text-green-500" />, text: 'APPROVED: Full access to platform features' },
            { icon: <Clock className="w-4 h-4 text-yellow-500" />, text: 'PENDING: Awaiting admin verification' },
            { icon: <UserX className="w-4 h-4 text-red-500" />, text: 'REJECTED: Application denied, requires resubmission' },
            { icon: <Flag className="w-4 h-4 text-orange-500" />, text: 'WARNED: Account flagged for policy violations' },
            { icon: <Ban className="w-4 h-4 text-red-600" />, text: 'BLOCKED: Temporary or permanent access restriction' }
          ]
        },
        {
          title: 'User Role Management',
          description: 'Assign and manage different user types:',
          roles: [
            { 
              role: 'Buyers', 
              permissions: [
                'Browse gemstone marketplace',
                'Place bids on listed items',
                'Schedule meetings with sellers',
                'Complete purchases and provide feedback'
              ], 
              color: 'blue',
              verification: 'Identity verification and contact details'
            },
            { 
              role: 'Sellers', 
              permissions: [
                'List gemstones for auction',
                'Create promotional advertisements',
                'Manage auction bids and meetings',
                'Complete sales and receive payments'
              ], 
              color: 'purple',
              verification: 'Business credentials, gemology certifications, address verification'
            },
            { 
              role: 'Admins', 
              permissions: [
                'Complete platform oversight',
                'User verification and management',
                'Content approval and moderation',
                'System configuration and maintenance'
              ], 
              color: 'green',
              verification: 'Internal appointment and security clearance'
            }
          ]
        },
        {
          title: 'Account Actions & Tools',
          description: 'Administrative actions available for user accounts:',
          features: [
            { icon: <Eye className="w-4 h-4" />, text: 'View Profile: Review complete user information and history' },
            { icon: <CheckCircle className="w-4 h-4" />, text: 'Approve/Reject: Change account verification status' },
            { icon: <Flag className="w-4 h-4" />, text: 'Issue Warning: Flag account for policy violations' },
            { icon: <Ban className="w-4 h-4" />, text: 'Block Account: Restrict access temporarily or permanently' },
            { icon: <Mail className="w-4 h-4" />, text: 'Contact User: Send direct communication to account holder' }
          ]
        }
      ]
    },
    {
      id: 'listing-management',
      title: '📦 Listing Management',
      icon: <Package className="w-5 h-5" />,
      content: [
        {
          title: 'Gemstone Listing Approval Process',
          description: 'Review and approve seller-submitted gemstone listings for platform authenticity.',
          actionButton: { text: 'Review Listings', action: () => handleNavigateToSection('listing-management') },
          workflow: [
            { step: 1, title: 'Seller Submission', description: 'Seller creates listing with gemstone details and documentation', icon: <Package className="w-5 h-5" /> },
            { step: 2, title: 'Admin Review', description: 'Verify gemstone authenticity, documentation, and listing accuracy', icon: <Eye className="w-5 h-5" /> },
            { step: 3, title: 'Quality Check', description: 'Ensure images, descriptions, and certifications meet standards', icon: <Shield className="w-5 h-5" /> },
            { step: 4, title: 'Approval Decision', description: 'Approve for auction or return with improvement feedback', icon: <CheckCircle className="w-5 h-5" /> }
          ]
        },
        {
          title: 'Listing Review Criteria',
          description: 'Key factors to evaluate when reviewing gemstone listings:',
          features: [
            { icon: <Shield className="w-4 h-4" />, text: 'Authentication: Valid certificates from recognized gemological institutes' },
            { icon: <Camera className="w-4 h-4" />, text: 'Image Quality: Clear, well-lit photos from multiple angles' },
            { icon: <FileText className="w-4 h-4" />, text: 'Accurate Description: Detailed specifications matching documentation' },
            { icon: <DollarSign className="w-4 h-4" />, text: 'Fair Pricing: Starting bids aligned with market value' },
            { icon: <UserCheck className="w-4 h-4" />, text: 'Seller Verification: Confirmed seller credentials and history' }
          ]
        },
        {
          title: 'Listing Status Management',
          description: 'Track and manage listing approval states:',
          features: [
            { icon: <Clock className="w-4 h-4 text-yellow-500" />, text: 'PENDING: Awaiting admin review and approval' },
            { icon: <CheckCircle className="w-4 h-4 text-green-500" />, text: 'APPROVED: Active and available for bidding' },
            { icon: <AlertCircle className="w-4 h-4 text-red-500" />, text: 'REJECTED: Returned to seller with feedback' },
            { icon: <Gavel className="w-4 h-4 text-blue-500" />, text: 'ACTIVE AUCTION: Currently receiving bids' },
            { icon: <Trophy className="w-4 h-4 text-purple-500" />, text: 'COMPLETED: Auction ended successfully' }
          ]
        }
      ]
    },
    {
      id: 'advertisement-management',
      title: '📺 Advertisement Management',
      icon: <Target className="w-5 h-5" />,
      content: [
        {
          title: 'Advertisement Approval Process',
          description: 'Review and approve seller promotional content for homepage display.',
          actionButton: { text: 'Review Advertisements', action: () => handleNavigateToSection('advertisement-management') },
          steps: [
            'Review submitted video and image content',
            'Verify content adheres to platform guidelines',
            'Check for appropriate messaging and branding',
            'Ensure technical requirements are met (file size, format)',
            'Approve or request modifications before publication'
          ]
        },
        {
          title: 'Content Review Guidelines',
          description: 'Standards for approving promotional advertisements:',
          features: [
            { icon: <Shield className="w-4 h-4" />, text: 'Content Policy: Family-friendly, professional, and accurate content' },
            { icon: <FileText className="w-4 h-4" />, text: 'Technical Standards: Proper file formats, sizes, and quality' },
            { icon: <Star className="w-4 h-4" />, text: 'Truthful Marketing: Accurate representation of products and services' },
            { icon: <UserCheck className="w-4 h-4" />, text: 'Seller Verification: Only approved sellers can create advertisements' },
            { icon: <Eye className="w-4 h-4" />, text: 'Visual Quality: High-resolution, professional appearance' }
          ]
        },
        {
          title: 'Advertisement Status Tracking',
          description: 'Monitor promotional content lifecycle:',
          features: [
            { icon: <Clock className="w-4 h-4 text-yellow-500" />, text: 'PENDING: Submitted and awaiting review' },
            { icon: <CheckCircle className="w-4 h-4 text-green-500" />, text: 'APPROVED: Active on homepage rotation' },
            { icon: <AlertCircle className="w-4 h-4 text-red-500" />, text: 'REJECTED: Returned with improvement feedback' },
            { icon: <Activity className="w-4 h-4 text-blue-500" />, text: 'ACTIVE: Currently displaying to users' }
          ]
        }
      ]
    },
    {
      id: 'meeting-oversight',
      title: '📅 Meeting & Attendance Management',
      icon: <Calendar className="w-5 h-5" />,
      content: [
        {
          title: 'Meeting Request Oversight',
          description: 'Monitor buyer-seller meeting coordination and scheduling.',
          actionButton: { text: 'Monitor Meetings', action: () => handleNavigateToSection('meeting-requests') },
          steps: [
            'Track meeting requests from auction winners',
            'Monitor seller response times to meeting requests',
            'Ensure meetings are scheduled within 24-hour window',
            'Verify meeting location and time confirmations',
            'Follow up on overdue or unresponded requests'
          ]
        },
        {
          title: 'Attendance Tracking System',
          description: 'Monitor meeting completion and no-show incidents:',
          actionButton: { text: 'View Attendance', action: () => handleNavigateToSection('attendance') },
          features: [
            { icon: <CheckCircle className="w-4 h-4 text-green-500" />, text: 'COMPLETED: Both parties attended and transaction completed' },
            { icon: <AlertCircle className="w-4 h-4 text-red-500" />, text: 'BUYER NO-SHOW: Buyer failed to attend scheduled meeting' },
            { icon: <AlertCircle className="w-4 h-4 text-orange-500" />, text: 'SELLER NO-SHOW: Seller failed to attend scheduled meeting' },
            { icon: <Clock className="w-4 h-4 text-yellow-500" />, text: 'SCHEDULED: Meeting confirmed but not yet completed' }
          ]
        },
        {
          title: 'No-Show Management',
          description: 'Handle missed meeting incidents and policy enforcement:',
          actionButton: { text: 'Manage No-Shows', action: () => handleNavigateToSection('no-show-management') },
          steps: [
            'Review reported no-show incidents',
            'Verify attendance status with both parties',
            'Issue warnings for first-time no-shows',
            'Apply account restrictions for repeat offenders',
            'Track user reliability and meeting completion rates'
          ]
        },
        {
          title: 'Meeting Analytics & Insights',
          description: 'Platform performance metrics for meeting system:',
          features: [
            { icon: <BarChart3 className="w-4 h-4" />, text: 'Completion Rate: Percentage of successful meetings' },
            { icon: <TrendingUp className="w-4 h-4" />, text: 'User Reliability: Individual attendance track records' },
            { icon: <Clock className="w-4 h-4" />, text: 'Response Time: Average seller response to meeting requests' },
            { icon: <Activity className="w-4 h-4" />, text: 'Peak Times: Most popular meeting scheduling periods' }
          ]
        }
      ]
    },
    {
      id: 'user-moderation',
      title: '🔒 User Moderation & Security',
      icon: <Shield className="w-5 h-5" />,
      content: [
        {
          title: 'Account Security & Moderation',
          description: 'Maintain platform safety through user account oversight and security measures.',
          actionButton: { text: 'View Blocked Users', action: () => handleNavigateToSection('blocked-users') },
          steps: [
            'Monitor user behavior and policy compliance',
            'Investigate reports of suspicious activity',
            'Issue warnings for policy violations',
            'Temporarily or permanently block problematic accounts',
            'Review and process account appeal requests'
          ]
        },
        {
          title: 'Warning & Suspension System',
          description: 'Progressive discipline system for policy enforcement:',
          workflow: [
            { step: 1, title: 'First Violation', description: 'Issue warning and provide policy education', icon: <Flag className="w-5 h-5" /> },
            { step: 2, title: 'Repeat Violation', description: 'Temporary account restrictions or features limitation', icon: <AlertCircle className="w-5 h-5" /> },
            { step: 3, title: 'Serious Violation', description: 'Temporary account suspension with review period', icon: <Lock className="w-5 h-5" /> },
            { step: 4, title: 'Severe/Multiple', description: 'Permanent account termination and ban', icon: <Ban className="w-5 h-5" /> }
          ]
        },
        {
          title: 'Common Violations & Actions',
          description: 'Typical policy violations and appropriate administrative responses:',
          violations: [
            { 
              type: 'Meeting No-Shows', 
              severity: 'Medium', 
              action: 'Warning → Temporary bidding restriction → Account suspension',
              color: 'yellow'
            },
            { 
              type: 'Fraudulent Listings', 
              severity: 'High', 
              action: 'Immediate listing removal → Account investigation → Permanent ban',
              color: 'red'
            },
            { 
              type: 'Inappropriate Content', 
              severity: 'Medium', 
              action: 'Content removal → Warning → Temporary content restriction',
              color: 'orange'
            },
            { 
              type: 'Payment Issues', 
              severity: 'High', 
              action: 'Transaction hold → Investigation → Account restriction until resolved',
              color: 'red'
            }
          ]
        }
      ]
    },
    {
      id: 'feedback-support',
      title: '💬 Feedback & Support Management',
      icon: <MessageCircle className="w-5 h-5" />,
      content: [
        {
          title: 'User Feedback Management',
          description: 'Monitor and respond to user feedback and support requests.',
          actionButton: { text: 'Review Feedback', action: () => handleNavigateToSection('feedback') },
          steps: [
            'Review incoming feedback from buyers and sellers',
            'Categorize feedback by type (bug report, feature request, complaint)',
            'Respond to user concerns and questions promptly',
            'Escalate technical issues to development team',
            'Track feedback trends and platform improvement opportunities'
          ]
        },
        {
          title: 'Support Request Categories',
          description: 'Common types of support requests and handling procedures:',
          features: [
            { icon: <AlertCircle className="w-4 h-4" />, text: 'Technical Issues: Platform bugs, login problems, feature malfunctions' },
            { icon: <Users className="w-4 h-4" />, text: 'Account Issues: Verification problems, status questions, access requests' },
            { icon: <DollarSign className="w-4 h-4" />, text: 'Transaction Disputes: Payment issues, meeting conflicts, listing problems' },
            { icon: <Star className="w-4 h-4" />, text: 'Feature Requests: Platform improvements, new functionality suggestions' },
            { icon: <Shield className="w-4 h-4" />, text: 'Security Concerns: Suspicious activity, fraud reports, safety issues' }
          ]
        },
        {
          title: 'Response Time Standards',
          description: 'Service level agreements for user support:',
          features: [
            { icon: <Clock className="w-4 h-4 text-red-500" />, text: 'Critical Issues: 2-4 hours (security, payment, access)' },
            { icon: <Clock className="w-4 h-4 text-yellow-500" />, text: 'High Priority: 8-12 hours (account verification, disputes)' },
            { icon: <Clock className="w-4 h-4 text-blue-500" />, text: 'Standard Issues: 24-48 hours (general questions, feedback)' },
            { icon: <Clock className="w-4 h-4 text-green-500" />, text: 'Enhancement Requests: 3-5 days (feature requests, improvements)' }
          ]
        }
      ]
    },
    {
      id: 'system-settings',
      title: '⚙️ System Configuration & Settings',
      icon: <Settings className="w-5 h-5" />,
      content: [
        {
          title: 'Platform Configuration Management',
          description: 'Configure system-wide settings and platform parameters.',
          actionButton: { text: 'Access Settings', action: () => handleNavigateToSection('settings') },
          steps: [
            'Configure auction timing and bidding parameters',
            'Set platform commission rates and fee structures',
            'Manage email notification templates and schedules',
            'Configure user verification requirements',
            'Set security policies and access controls'
          ]
        },
        {
          title: 'Notification System Management',
          description: 'Control platform-wide notification settings:',
          features: [
            { icon: <Bell className="w-4 h-4" />, text: 'Email Notifications: Configure automated email triggers and templates' },
            { icon: <Activity className="w-4 h-4" />, text: 'In-App Alerts: Set up real-time notification badges and messages' },
            { icon: <Clock className="w-4 h-4" />, text: 'Reminder System: Schedule follow-up notifications for user actions' },
            { icon: <Target className="w-4 h-4" />, text: 'User Targeting: Configure notifications based on user roles and status' }
          ]
        },
        {
          title: 'Security & Compliance Settings',
          description: 'Maintain platform security and regulatory compliance:',
          features: [
            { icon: <Shield className="w-4 h-4" />, text: 'Access Controls: User permissions and administrative privileges' },
            { icon: <Database className="w-4 h-4" />, text: 'Data Protection: Privacy settings and data retention policies' },
            { icon: <Lock className="w-4 h-4" />, text: 'Security Protocols: Authentication requirements and session management' },
            { icon: <FileText className="w-4 h-4" />, text: 'Audit Logging: Track administrative actions and system changes' }
          ]
        }
      ]
    },
    {
      id: 'analytics-reporting',
      title: '📊 Analytics & Reporting',
      icon: <BarChart3 className="w-5 h-5" />,
      content: [
        {
          title: 'Platform Performance Metrics',
          description: 'Monitor overall platform health and user engagement.',
          features: [
            { icon: <Users className="w-4 h-4" />, text: 'User Statistics: Registration rates, verification status, active users' },
            { icon: <Package className="w-4 h-4" />, text: 'Listing Metrics: Submission rates, approval rates, auction success' },
            { icon: <DollarSign className="w-4 h-4" />, text: 'Transaction Volume: Sales completed, average values, commission earned' },
            { icon: <Calendar className="w-4 h-4" />, text: 'Meeting Statistics: Completion rates, no-show incidents, scheduling efficiency' }
          ]
        },
        {
          title: 'User Behavior Analytics',
          description: 'Understand user patterns and platform usage:',
          features: [
            { icon: <TrendingUp className="w-4 h-4" />, text: 'Activity Trends: Peak usage times, seasonal patterns, feature adoption' },
            { icon: <Target className="w-4 h-4" />, text: 'Conversion Rates: Registration to verification, listings to sales' },
            { icon: <Star className="w-4 h-4" />, text: 'Satisfaction Metrics: User feedback scores, retention rates' },
            { icon: <Activity className="w-4 h-4" />, text: 'Engagement Levels: Session duration, feature usage, return visits' }
          ]
        },
        {
          title: 'Custom Reports & Data Export',
          description: 'Generate detailed reports for analysis and compliance:',
          steps: [
            'Create custom date range reports for specific metrics',
            'Export user data for verification and compliance audits',
            'Generate financial reports for commission and transaction tracking',
            'Download platform usage statistics for performance analysis',
            'Create automated recurring reports for stakeholders'
          ]
        }
      ]
    }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <Shield className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin User Manual</h1>
        <p className="text-lg text-gray-600">Complete platform administration and management guide</p>
      </div>

      {/* Quick Access Dashboard */}
      <div className="mb-8 p-6 bg-green-50 rounded-lg">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Access Dashboard</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => handleNavigateToSection('user-management')}
            className="flex flex-col items-center p-4 bg-white rounded-lg hover:bg-green-100 transition-colors"
          >
            <Users className="w-8 h-8 text-green-600 mb-2" />
            <span className="text-sm font-medium text-gray-700">User Management</span>
          </button>
          <button
            onClick={() => handleNavigateToSection('listing-management')}
            className="flex flex-col items-center p-4 bg-white rounded-lg hover:bg-green-100 transition-colors"
          >
            <Package className="w-8 h-8 text-green-600 mb-2" />
            <span className="text-sm font-medium text-gray-700">Listings</span>
          </button>
          <button
            onClick={() => handleNavigateToSection('meeting-requests')}
            className="flex flex-col items-center p-4 bg-white rounded-lg hover:bg-green-100 transition-colors"
          >
            <Calendar className="w-8 h-8 text-green-600 mb-2" />
            <span className="text-sm font-medium text-gray-700">Meetings</span>
          </button>
          <button
            onClick={() => handleNavigateToSection('settings')}
            className="flex flex-col items-center p-4 bg-white rounded-lg hover:bg-green-100 transition-colors"
          >
            <Settings className="w-8 h-8 text-green-600 mb-2" />
            <span className="text-sm font-medium text-gray-700">Settings</span>
          </button>
        </div>
      </div>

      {/* Table of Contents */}
      <div className="mb-8 p-6 bg-gray-50 rounded-lg">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Complete Admin Manual</h2>
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
                                <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                                  <span className="text-xs font-medium text-green-600">{stepIndex + 1}</span>
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
                                <span className="text-green-600">{feature.icon}</span>
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
                                <div className="flex-shrink-0 w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">
                                  {step.step}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <span className="text-green-600">{step.icon}</span>
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
                          <div className="space-y-4">
                            {content.roles.map((role: any, roleIndex: number) => (
                              <div key={roleIndex} className={`p-4 rounded-lg border-l-4 border-${role.color}-500 bg-${role.color}-50`}>
                                <div className="flex justify-between items-start mb-2">
                                  <h4 className={`font-semibold text-${role.color}-900`}>{role.role}</h4>
                                  <span className={`text-xs px-2 py-1 bg-${role.color}-200 text-${role.color}-800 rounded-full`}>
                                    {role.verification}
                                  </span>
                                </div>
                                <ul className="space-y-1">
                                  {role.permissions.map((permission: string, permIndex: number) => (
                                    <li key={permIndex} className={`text-sm text-${role.color}-700`}>
                                      • {permission}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Violations */}
                        {'violations' in content && content.violations && (
                          <div className="space-y-3">
                            {content.violations.map((violation: any, violationIndex: number) => (
                              <div key={violationIndex} className={`p-4 rounded-lg border-l-4 border-${violation.color}-500 bg-${violation.color}-50`}>
                                <div className="flex justify-between items-start mb-2">
                                  <h4 className={`font-semibold text-${violation.color}-900`}>{violation.type}</h4>
                                  <span className={`text-xs px-2 py-1 bg-${violation.color}-200 text-${violation.color}-800 rounded-full`}>
                                    {violation.severity}
                                  </span>
                                </div>
                                <p className={`text-sm text-${violation.color}-700`}>{violation.action}</p>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Action Button */}
                        {'actionButton' in content && content.actionButton && (
                          <button
                            onClick={content.actionButton.action}
                            className="inline-flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
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

      {/* Admin Emergency Contacts */}
      <div className="mt-12 p-6 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-6 h-6 text-red-600 mt-1" />
          <div>
            <h3 className="text-lg font-semibold text-red-900 mb-2">Emergency Procedures</h3>
            <p className="text-red-700 mb-4">
              For critical security issues, platform outages, or urgent escalations that require immediate attention.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-red-900">Technical Emergencies</h4>
                <p className="text-sm text-red-700">• Platform outages or critical bugs</p>
                <p className="text-sm text-red-700">• Security breaches or data issues</p>
                <p className="text-sm text-red-700">• Payment system failures</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-red-900">User Safety Issues</h4>
                <p className="text-sm text-red-700">• Fraudulent activity reports</p>
                <p className="text-sm text-red-700">• User safety concerns</p>
                <p className="text-sm text-red-700">• Legal compliance issues</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 p-6 bg-green-50 rounded-lg text-center">
        <h3 className="text-lg font-semibold text-green-900 mb-2">Admin Support Resources</h3>
        <p className="text-green-700 mb-4">
          As a platform administrator, you have access to all support channels and documentation.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4">
          <a
            href="mailto:gemnetsystem@gmail.com"
            className="inline-flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Mail className="w-4 h-4" />
            <span>System Administration</span>
          </a>
          <button
            onClick={() => handleNavigateToSection('feedback')}
            className="inline-flex items-center space-x-2 px-4 py-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Platform Feedback</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminUserManual;