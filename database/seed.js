const { sequelize, User, Track, Interaction } = require('../models');
const bcrypt = require('bcryptjs');

async function seedDatabase() {
  try {
    // Clear existing data
    await sequelize.sync({ force: true });
    
    // Create Users
    const users = await User.bulkCreate([
      {
        name: 'Maya Rodriguez',
        email: 'maya@example.com',
        password: 'password123',
        role: 'artist',
        bio: 'Indie singer-songwriter from Austin, TX',
        is_verified: true
      },
      {
        name: 'James Chen',
        email: 'james@example.com',
        password: 'password123',
        role: 'artist',
        bio: 'Electronic music producer',
        is_verified: true
      },
      {
        name: 'Sarah Johnson',
        email: 'sarah@example.com',
        password: 'password123',
        role: 'fan',
        bio: 'Music lover and concert goer',
        is_verified: true
      },
      {
        name: 'Mike Thompson',
        email: 'mike@example.com',
        password: 'password123',
        role: 'fan',
        bio: 'Always looking for new artists',
        is_verified: true
      },
      {
        name: 'Admin User',
        email: process.env.ADMIN_EMAIL || 'admin@example.com',
        password: process.env.ADMIN_PASSWORD || 'admin123',
        role: 'admin',
        bio: 'Platform Administrator',
        is_verified: true
      }
    ]);
    
    console.log(`Created ${users.length} users`);
    
    // Create Tracks
    const tracks = await Track.bulkCreate([
      {
        title: 'Midnight Dreams',
        artist_id: 1,
        genre: 'Indie Pop',
        duration: 210,
        file_url: 'https://example.com/tracks/midnight-dreams.mp3',
        cover_art_url: 'https://example.com/covers/midnight-dreams.jpg',
        price_model: 'pay-what-you-want',
        suggested_price: 4.50
      },
      {
        title: 'Electric Heartbeat',
        artist_id: 2,
        genre: 'Electronic',
        duration: 185,
        file_url: 'https://example.com/tracks/electric-heartbeat.mp3',
        cover_art_url: 'https://example.com/covers/electric-heartbeat.jpg',
        price_model: 'pay-what-you-want',
        suggested_price: 3.99
      },
      {
        title: 'Summer Rain',
        artist_id: 1,
        genre: 'Indie Folk',
        duration: 235,
        file_url: 'https://example.com/tracks/summer-rain.mp3',
        cover_art_url: 'https://example.com/covers/summer-rain.jpg',
        price_model: 'free',
        suggested_price: 0
      },
      {
        title: 'Neon Lights',
        artist_id: 2,
        genre: 'Synthwave',
        duration: 198,
        file_url: 'https://example.com/tracks/neon-lights.mp3',
        cover_art_url: 'https://example.com/covers/neon-lights.jpg',
        price_model: 'pay-what-you-want',
        suggested_price: 4.99
      },
      {
        title: 'Whispers in the Dark',
        artist_id: 1,
        genre: 'Acoustic',
        duration: 245,
        file_url: 'https://example.com/tracks/whispers.mp3',
        cover_art_url: 'https://example.com/covers/whispers.jpg',
        price_model: 'free',
        suggested_price: 0
      }
    ]);
    
    console.log(`Created ${tracks.length} tracks`);
    
    // Create Interactions
    const interactions = await Interaction.bulkCreate([
      { user_id: 3, track_id: 1, type: 'play', metadata: { source: 'discovery' } },
      { user_id: 3, track_id: 1, type: 'like', metadata: { liked_at: new Date() } },
      { user_id: 4, track_id: 1, type: 'play', metadata: { source: 'search' } },
      { user_id: 4, track_id: 2, type: 'like', metadata: { liked_at: new Date() } },
      { user_id: 3, track_id: 2, type: 'comment', comment_text: 'This track is amazing! Love the beat 🔥' },
      { user_id: 4, track_id: 1, type: 'purchase', purchase_amount: 5.00 }
    ]);
    
    console.log(`Created ${interactions.length} interactions`);
    
    // Update track counts
    for (const track of tracks) {
      const playCount = await Interaction.count({ where: { track_id: track.id, type: 'play' } });
      const likeCount = await Interaction.count({ where: { track_id: track.id, type: 'like' } });
      await track.update({ play_count: playCount, like_count: likeCount });
    }
    
    console.log('Updated track statistics');
    console.log('\n📊 Test Credentials:');
    console.log('Artist: maya@example.com / password123');
    console.log('Fan: sarah@example.com / password123');
    console.log('Admin: admin@example.com / admin123');
    console.log('\nDatabase seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();