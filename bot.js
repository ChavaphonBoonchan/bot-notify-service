const { Client, GatewayIntentBits, EmbedBuilder, ActivityType } = require('discord.js');
const axios = require('axios');
require('dotenv').config();

class StatusBot {
    constructor() {
        this.client = new Client({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent
            ]
        });
        
        this.websites = process.env.WEBSITES ? process.env.WEBSITES.split(',') : [];
        this.checkInterval = parseInt(process.env.CHECK_INTERVAL) || 300000; // 5 minutes default
        this.channelId = process.env.CHANNEL_ID;
        this.statusMessage = null;
        this.lastStatuses = new Map();
        
        this.setupBot();
    }
    
    setupBot() {
        this.client.once('ready', async () => {
            console.log(`✅ Bot logged in as ${this.client.user.tag}`);
            
            // Set bot status
            this.client.user.setActivity('Website Status', { type: ActivityType.Watching });
            
            // Start monitoring
            await this.startMonitoring();
        });
        
        this.client.on('messageCreate', async (message) => {
            if (message.author.bot) return;
            
            // Command to manually check status
            if (message.content.toLowerCase() === '!status') {
                await this.checkAndUpdateStatus(true);
            }
            
            // Command to reset status message
            if (message.content.toLowerCase() === '!reset') {
                if (message.member.permissions.has('Administrator')) {
                    this.statusMessage = null;
                    await this.checkAndUpdateStatus(true);
                    await message.react('✅');
                }
            }
        });
        
        this.client.login(process.env.DISCORD_TOKEN);
    }
    
    async startMonitoring() {
        // Initial check
        await this.checkAndUpdateStatus(true);
        
        // Set up interval
        setInterval(async () => {
            await this.checkAndUpdateStatus();
        }, this.checkInterval);
        
        console.log(`🔄 Started monitoring ${this.websites.length} websites every ${this.checkInterval / 1000} seconds`);
    }
    
    async checkWebsiteStatus(url) {
        try {
            const startTime = Date.now();
            const response = await axios.get(url, {
                timeout: 10000,
                validateStatus: (status) => status < 500 // Accept 4xx as "up" but with issues
            });
            const responseTime = Date.now() - startTime;
            
            return {
                url,
                status: 'online',
                statusCode: response.status,
                responseTime,
                error: null
            };
        } catch (error) {
            return {
                url,
                status: 'offline',
                statusCode: error.response?.status || null,
                responseTime: null,
                error: error.message
            };
        }
    }
    
    async checkAndUpdateStatus(forceUpdate = false) {
        try {
            const channel = await this.client.channels.fetch(this.channelId);
            if (!channel) {
                console.error('❌ Channel not found');
                return;
            }
            
            console.log('🔍 Checking website statuses...');
            
            // Check all websites
            const statusChecks = await Promise.all(
                this.websites.map(url => this.checkWebsiteStatus(url.trim()))
            );
            
            // Check if any status changed
            let hasChanges = forceUpdate;
            for (const check of statusChecks) {
                const lastStatus = this.lastStatuses.get(check.url);
                if (!lastStatus || lastStatus.status !== check.status || lastStatus.statusCode !== check.statusCode) {
                    hasChanges = true;
                    break;
                }
            }
            
            if (!hasChanges && this.statusMessage) {
                console.log('📊 No changes detected, skipping update');
                return;
            }
            
            // Update last statuses
            statusChecks.forEach(check => {
                this.lastStatuses.set(check.url, {
                    status: check.status,
                    statusCode: check.statusCode,
                    timestamp: new Date()
                });
            });
            
            // Create embed
            const embed = this.createStatusEmbed(statusChecks);
            
            if (this.statusMessage) {
                // Update existing message
                try {
                    await this.statusMessage.edit({ embeds: [embed] });
                    console.log('✅ Status message updated');
                } catch (error) {
                    console.log('⚠️ Could not edit message, sending new one:', error.message);
                    this.statusMessage = await channel.send({ embeds: [embed] });
                }
            } else {
                // Send new message
                this.statusMessage = await channel.send({ embeds: [embed] });
                console.log('📤 New status message sent');
            }
            
        } catch (error) {
            console.error('❌ Error checking status:', error);
        }
    }
    
    createStatusEmbed(statusChecks) {
        const onlineCount = statusChecks.filter(s => s.status === 'online').length;
        const totalCount = statusChecks.length;
        
        // Determine overall status color
        let color;
        if (onlineCount === totalCount) {
            color = 0x00ff00; // Green - all online
        } else if (onlineCount === 0) {
            color = 0xff0000; // Red - all offline
        } else {
            color = 0xffaa00; // Orange - partial issues
        }
        
        const embed = new EmbedBuilder()
            .setTitle('🔍 Website Status Monitor')
            .setDescription(`Monitoring ${totalCount} websites • ${onlineCount}/${totalCount} online`)
            .setColor(color)
            .setTimestamp()
            .setFooter({ 
                text: `Last checked • Updates every ${this.checkInterval / 60000} minutes`,
                iconURL: this.client.user.displayAvatarURL()
            });
        
        // Add field for each website
        statusChecks.forEach(check => {
            const statusEmoji = check.status === 'online' ? '🟢' : '🔴';
            const responseTimeText = check.responseTime ? `(${check.responseTime}ms)` : '';
            const statusCodeText = check.statusCode ? `[${check.statusCode}]` : '';
            
            let statusText = `${statusEmoji} **${check.status.toUpperCase()}** ${statusCodeText} ${responseTimeText}`;
            
            if (check.error && check.status === 'offline') {
                statusText += `\n\`${check.error.substring(0, 50)}${check.error.length > 50 ? '...' : ''}\``;
            }
            
            embed.addFields({
                name: check.url.replace(/^https?:\/\//, ''),
                value: statusText,
                inline: true
            });
        });
        
        return embed;
    }
}

// Start the bot
if (process.env.DISCORD_TOKEN && process.env.CHANNEL_ID) {
    new StatusBot();
} else {
    console.error('❌ Missing required environment variables. Please check your .env file.');
    console.log('Required variables: DISCORD_TOKEN, CHANNEL_ID');
}
