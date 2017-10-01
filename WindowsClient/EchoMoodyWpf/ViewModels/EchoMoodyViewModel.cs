using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Threading;
using System.Windows.Media.Imaging;
using System.Windows.Threading;
using AForge.Video.DirectShow;
using GalaSoft.MvvmLight;
using GalaSoft.MvvmLight.Command;

namespace EchoMoodyWpf.ViewModels
{
    public class EchoMoodyViewModel : ViewModelBase
    {
        public RelayCommand TriggerButtonClick { get; set; }

        private BitmapImage _videoStream;
        public BitmapImage VideoStream
        {
            get { return _videoStream; }
            set
            {
                _videoStream = value;
                RaisePropertyChanged("VideoStream");
            }
        }
        private BitmapImage _faceImage;

        public BitmapImage FaceImage
        {
            get { return _faceImage; }
            set
            {
                _faceImage = value;
                RaisePropertyChanged("FaceImage");
            }
        }

        private string _identifyResultText;
        public string IdentifyResultText
        {
            get { return _identifyResultText; }
            set
            {
                _identifyResultText = value;
                RaisePropertyChanged("IdentifyResultText");
            }
        }
        

        private Bitmap _lastFrame;

        public EchoMoodyViewModel()
        {
            TriggerButtonClick = new RelayCommand(TakePicture);

            //Initialize Camera
            FilterInfoCollection filter = new FilterInfoCollection(FilterCategory.VideoInputDevice);
            var device = new VideoCaptureDevice(filter[0].MonikerString);
            device.NewFrame += Device_NewFrame;
            device.Start();
        }

        public void TakePicture()
        {
            if (_lastFrame == null)
                return;

            Bitmap facebtm = (Bitmap)_lastFrame.Clone();
            _lastFrame.Dispose();

            Random rand = new Random();
            string extraNum = rand.Next(100000).ToString();
            string imageName = @"C:\Users\Thomas\OneDrive\Öffentlich\moody\face.jpg";


            facebtm.Save(imageName, ImageFormat.Jpeg);
            
        }


        private void Device_NewFrame(object sender, AForge.Video.NewFrameEventArgs eventArgs)
        {
            _lastFrame = (Bitmap)eventArgs.Frame.Clone();

            MemoryStream ms = new MemoryStream();
            _lastFrame.Save(ms, ImageFormat.Bmp);
            ms.Seek(0, SeekOrigin.Begin);
            BitmapImage bi = new BitmapImage();
            bi.BeginInit();
            bi.StreamSource = ms;
            bi.EndInit();

            bi.Freeze();
            Dispatcher.CurrentDispatcher.Invoke(new ThreadStart(delegate
            {
                VideoStream = bi;
            }));
        }

        private string CreateBase64Image(Bitmap image)
        {
            using (MemoryStream ms = new MemoryStream())
            {
                /* Convert this image back to a base64 string */
                image.Save(ms, System.Drawing.Imaging.ImageFormat.Png);
                return Convert.ToBase64String(ms.ToArray());
            }
        }

        private Image GetThumbnail(Bitmap image)
        {
            return image.GetThumbnailImage(25, 25, () => false, IntPtr.Zero);
        }
    }
}

