/** Only AV mappings name this converter. Native extraction/translation/identity stay intact. */
export const AV_STRUCTURED = 'av-structured-context';
export function createAvStructuredConverter(NativeStructured, Runtime) {
  return new class extends NativeStructured {
    _fieldRuntime(runtime = {}, sourceKey = null) {
      // Native nested structured calls otherwise stack plain {runtime, sourceKey}
      // wrappers. CompendiumRuntime.from recognizes only one such wrapper.
      return super._fieldRuntime(Runtime.from(runtime), sourceKey);
    }
  }();
}
