using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookLabServices
{
    public interface IAwsS3Service
    {
        Task<string> UploadFileAsync(Stream fileStream, string fileName);
        Task<bool> DeleteFileAsync(string fileName);
        Task<string> UpdateFileAsync(Stream fileStream, string fileName);
    }
}
