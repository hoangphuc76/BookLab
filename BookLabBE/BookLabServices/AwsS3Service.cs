using Amazon.S3;
using Amazon.S3.Model;
using Microsoft.Extensions.Configuration;
using System;
using System.IO;
using System.Threading.Tasks;
using HeyRed.Mime;
using BookLabServices;

public class AwsS3Service : IAwsS3Service
{
    private readonly string _bucketName;
    private readonly IAmazonS3 _s3Client;

    public AwsS3Service(IConfiguration configuration)
    {
        _bucketName = configuration["AWS:BucketName"];
        var accessKey = configuration["AWS:AccessKey"];
        var secretKey = configuration["AWS:SecretKey"];
        var region = configuration["AWS:Region"];

        _s3Client = new AmazonS3Client(accessKey, secretKey, Amazon.RegionEndpoint.GetBySystemName(region));
    }

    public async Task<string> UploadFileAsync(Stream fileStream, string fileName)
    {
        string contentType = MimeTypesMap.GetMimeType(Path.GetExtension(fileName));
        var request = new PutObjectRequest
        {
            BucketName = _bucketName,
            Key = fileName,
            InputStream = fileStream,
            ContentType = contentType,
        };

        var response = await _s3Client.PutObjectAsync(request);

        return $"https://{_bucketName}.s3.{_s3Client.Config.RegionEndpoint.SystemName}.amazonaws.com/{fileName}";
    }

    public async Task<bool> DeleteFileAsync(string fileName)
    {
        try
        {
            var request = new DeleteObjectRequest
            {
                BucketName = _bucketName,
                Key = fileName
            };

            var response = await _s3Client.DeleteObjectAsync(request);

            return response.HttpStatusCode == System.Net.HttpStatusCode.NoContent;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Unknown error: {ex.Message}");
            return false;
        }
    }

    public async Task<string> UpdateFileAsync(Stream fileStream, string fileName)
    {
        try
        {
            string contentType = MimeTypesMap.GetMimeType(Path.GetExtension(fileName));
            var request = new PutObjectRequest
            {
                BucketName = _bucketName,
                Key = fileName,
                InputStream = fileStream,
                ContentType = contentType,
                CannedACL = S3CannedACL.PublicRead
            };

            var response = await _s3Client.PutObjectAsync(request);

            if (response.HttpStatusCode == System.Net.HttpStatusCode.OK)
            {
                return $"https://{_bucketName}.s3.{_s3Client.Config.RegionEndpoint.SystemName}.amazonaws.com/{fileName}";
            }
            else
            {
                throw new Exception($"Failed to update file: {response.HttpStatusCode}");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Exception: {ex.Message}");
            throw;
        }
    }
}
