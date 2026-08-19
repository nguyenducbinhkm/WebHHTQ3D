import os
import subprocess

def convert_to_hls(input_path: str, output_dir: str):
    """
    Sử dụng FFmpeg để cắt file video MP4 thành các file phân đoạn HLS (.m3u8 và .ts)
    Tối ưu hóa tốc độ encode cho video dung lượng lớn.
    """
    os.makedirs(output_dir, exist_ok=True)
    output_m3u8 = os.path.join(output_dir, "playlist.m3u8")

    # Lệnh FFmpeg cắt video HLS được tối ưu tốc độ cho file nặng
    command = [
        "ffmpeg",
        "-i", input_path,
        "-c:v", "libx264",
        "-preset", "veryfast",  # Tăng tốc độ encode đáng kể cho file dung lượng lớn
        "-threads", "0",        # Tự động tận dụng tối đa số nhân CPU của máy chủ
        "-c:a", "aac",
        "-hls_time", "10",
        "-hls_list_size", "0",
        "-f", "hls",
        output_m3u8
    ]

    process = subprocess.run(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    
    if process.returncode != 0:
        raise Exception(f"Lỗi FFmpeg: {process.stderr.decode('utf-8')}")

    return output_m3u8