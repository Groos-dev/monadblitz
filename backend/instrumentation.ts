// Next.js instrumentation hook - 在服务器启动时运行
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { initBackend } = await import('./lib/init');
    await initBackend();
  }
}

