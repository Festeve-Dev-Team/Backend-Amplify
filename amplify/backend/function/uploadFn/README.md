# Upload Service (uploadFn)

## Overview
File upload service handling image uploads, file validation, AWS S3 integration, and secure file management for the Festeve platform.

## Required Environment Variables

### Core Configuration
- `MONGODB_URI` - MongoDB connection string (for upload metadata)
- `JWT_SECRET` - Secret key for JWT token verification
- `LOG_LEVEL` - Logging level (default: info)

### AWS Configuration
- `AWS_S3_BUCKET` - S3 bucket name for file storage
- `AWS_REGION` - AWS region (default: us-east-1)
- `AWS_ACCESS_KEY_ID` - AWS access key (via AWS credentials)
- `AWS_SECRET_ACCESS_KEY` - AWS secret key (via AWS credentials)

### Security & CORS
- `ALLOWED_ORIGINS` - CORS allowed origins

### File Upload Configuration
- `MAX_FILE_SIZE` - Maximum file size in bytes (default: 10MB)
- `ALLOWED_MIME_TYPES` - Comma-separated list of allowed MIME types

## API Endpoints

### File Upload Endpoints
- `POST /upload/:folder` - Upload file to specified folder
- `GET /upload/:folder/:filename` - Get file URL (if public)
- `DELETE /upload/:folder/:filename` - Delete file (admin only)

### File Management Endpoints
- `GET /admin/uploads` - List all uploads (admin only)
- `GET /admin/uploads/stats` - Upload statistics (admin only)

## Supported File Types

### Images
- JPEG (`image/jpeg`)
- PNG (`image/png`)
- WebP (`image/webp`)
- GIF (`image/gif`)

### Documents (if enabled)
- PDF (`application/pdf`)

## Upload Folders

### Organized by Purpose
- `products` - Product images
- `banners` - Banner images
- `avatars` - User profile pictures
- `testimonials` - Testimonial images
- `events` - Event images
- `documents` - Official documents

## File Processing

### Image Optimization
- Automatic image compression
- Multiple size variants (thumbnail, medium, large)
- WebP conversion for modern browsers
- EXIF data removal for privacy

### Security Validation
- File type validation by content (not just extension)
- Virus scanning (if antivirus service configured)
- File size limits enforced
- Malicious file detection

## Sample .env Configuration

```bash
# Core
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/
JWT_SECRET=super-secret-key-here
LOG_LEVEL=info

# AWS S3 Configuration
AWS_S3_BUCKET=festeve-uploads-prod
AWS_REGION=us-east-1
# AWS credentials should be set via IAM roles or environment

# File Upload Settings
MAX_FILE_SIZE=10485760
ALLOWED_MIME_TYPES=image/jpeg,image/png,image/webp,image/gif

# CORS
ALLOWED_ORIGINS=https://app.festeve.com,https://admin.festeve.com
```

## Local Development

### Prerequisites
- Node.js 18+
- AWS credentials configured (via AWS CLI or environment)
- S3 bucket created and accessible
- MongoDB connection for metadata storage

### Setup
```bash
cd amplify/backend/function/uploadFn/src
npm install
```

### Testing with Amplify Mock
```bash
# Create test event for file upload
cat > event.json << EOF
{
  "httpMethod": "POST",
  "path": "/upload/products",
  "headers": {
    "Content-Type": "multipart/form-data; boundary=----WebKitFormBoundary",
    "Authorization": "Bearer eyJ..."
  },
  "body": "------WebKitFormBoundary\r\nContent-Disposition: form-data; name=\"file\"; filename=\"test.jpg\"\r\nContent-Type: image/jpeg\r\n\r\n[BINARY DATA]\r\n------WebKitFormBoundary--",
  "isBase64Encoded": true
}
EOF

# Run local test
amplify mock function uploadFn --event event.json
```

### Build
```bash
npm run build
```

## Production Deployment

### Pre-deployment Checklist
- [ ] S3 bucket created and configured
- [ ] AWS credentials/IAM roles configured
- [ ] Bucket policies set for public read access (if needed)
- [ ] CloudFront distribution configured (recommended)
- [ ] File size limits appropriate for use case
- [ ] CORS configured for upload origins

### Deploy
```bash
amplify push
```

### Post-deployment Verification
- [ ] File uploads work from client applications
- [ ] Files are stored in correct S3 bucket/folders
- [ ] File URLs are accessible and secure
- [ ] File deletion works for authorized users
- [ ] Image optimization is functioning
- [ ] File type validation is working

## AWS S3 Configuration

### Bucket Policy (Example)
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::festeve-uploads-prod/public/*"
    }
  ]
}
```

### CORS Configuration
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "POST", "PUT", "DELETE"],
    "AllowedOrigins": ["https://app.festeve.com", "https://admin.festeve.com"],
    "ExposeHeaders": ["ETag"]
  }
]
```

## File Storage Structure

### S3 Bucket Organization
```
festeve-uploads-prod/
├── products/
│   ├── original/
│   ├── thumbnail/
│   ├── medium/
│   └── large/
├── avatars/
│   ├── original/
│   └── thumbnail/
├── banners/
│   └── original/
└── documents/
    └── private/
```

## Security Considerations

### Access Control
- Authentication required for all uploads
- Folder-based access restrictions
- File deletion requires ownership verification
- Admin-only access to sensitive folders

### File Security
- Content-type validation prevents malicious uploads
- File size limits prevent abuse
- Virus scanning recommended for production
- Direct S3 access URLs expire after configured time

### Privacy
- Private files use signed URLs
- Public files use CloudFront for performance
- User-uploaded content segregated by user ID
- Automatic cleanup of orphaned files

## Performance Optimization

### Upload Performance
- Direct S3 upload with presigned URLs (recommended)
- Chunked upload for large files
- Progress tracking for user experience
- Parallel uploads for multiple files

### Delivery Performance
- CloudFront CDN for global distribution
- Image optimization and compression
- Lazy loading support with placeholder images
- Progressive JPEG for faster perceived loading

## Monitoring & Maintenance

### Metrics to Monitor
- Upload success/failure rates
- File processing times
- Storage usage and costs
- CDN hit rates and performance

### Maintenance Tasks
- Regular cleanup of expired uploads
- Storage cost optimization
- Security audit of uploaded files
- Performance monitoring and optimization
