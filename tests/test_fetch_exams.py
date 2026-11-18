import importlib.util
from pathlib import Path
import subprocess
import tempfile
import unittest
from unittest.mock import patch

spec = importlib.util.spec_from_file_location(
    'fetch_exams', Path(__file__).parents[1] / 'scripts' / 'fetch-exams.py'
)
fetch_exams = importlib.util.module_from_spec(spec)
spec.loader.exec_module(fetch_exams)


class FetchExamsTests(unittest.TestCase):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory()
        self.addCleanup(self.directory.cleanup)
        self.target = Path(self.directory.name) / 'new' / 'nested' / 'exam.pdf'

    def downloader(self, payloads):
        def download(args):
            Path(args[-1]).write_bytes(next(payloads))
            return subprocess.CompletedProcess(args, 0)
        return download

    def test_creates_missing_directory_and_publishes_valid_pdf(self):
        with patch.object(fetch_exams.subprocess, 'run', side_effect=self.downloader(iter([b'%PDF-1.7 test']))):
            fetch_exams.get('https://example.test/exam', self.target)
        self.assertEqual(self.target.read_bytes(), b'%PDF-1.7 test')
        self.assertEqual(list(self.target.parent.iterdir()), [self.target])

    def test_reuses_valid_pdf_without_downloading(self):
        self.target.parent.mkdir(parents=True)
        self.target.write_bytes(b'%PDF-1.7 cached')
        with patch.object(fetch_exams.subprocess, 'run') as download:
            fetch_exams.get('https://example.test/exam', self.target)
        download.assert_not_called()
        self.assertEqual(self.target.read_bytes(), b'%PDF-1.7 cached')

    def test_replaces_corrupt_cache_and_retries_invalid_downloads(self):
        for cache in [b'', b'<html>error</html>']:
            with self.subTest(cache=cache):
                self.target.parent.mkdir(parents=True, exist_ok=True)
                self.target.write_bytes(cache)
                with patch.object(fetch_exams.subprocess, 'run', side_effect=self.downloader(iter([b'<html>blocked</html>', b'', b'%PDF recovered']))) as download:
                    fetch_exams.get('https://example.test/exam', self.target)
                self.assertEqual(download.call_count, 3)
                self.assertEqual(self.target.read_bytes(), b'%PDF recovered')
                self.assertEqual(list(self.target.parent.iterdir()), [self.target])

    def test_failed_download_keeps_old_cache_and_cleans_temporary_files(self):
        self.target.parent.mkdir(parents=True)
        self.target.write_bytes(b'old invalid cache')
        with patch.object(fetch_exams.subprocess, 'run', return_value=subprocess.CompletedProcess([], 23)) as download:
            with self.assertRaises(RuntimeError):
                fetch_exams.get('https://example.test/exam', self.target)
        self.assertEqual(download.call_count, 3)
        self.assertEqual(self.target.read_bytes(), b'old invalid cache')
        self.assertEqual(list(self.target.parent.iterdir()), [self.target])

    def test_all_invalid_responses_are_rejected_without_publishing(self):
        with patch.object(fetch_exams.subprocess, 'run', side_effect=self.downloader(iter([b'HTML', b'', b'error']))):
            with self.assertRaises(RuntimeError):
                fetch_exams.get('https://example.test/exam', self.target)
        self.assertFalse(self.target.exists())
        self.assertEqual(list(self.target.parent.iterdir()), [])


if __name__ == '__main__':
    unittest.main()
