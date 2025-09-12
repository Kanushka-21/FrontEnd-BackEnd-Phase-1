package com.gemnet.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Configuration class to enable Spring Scheduler for automated tasks
 */
@Configuration
@EnableScheduling
public class SchedulerConfig {
    // This class enables @Scheduled annotations throughout the application
    // Specifically for MeetingReminderService scheduled tasks
}
